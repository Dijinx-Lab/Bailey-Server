import ChallengeDAO from "../data/challenges_dao.mjs";
import { ObjectId } from "mongodb";
import AuthUtil from "../utility/auth_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TokenUtil from "../utility/token_util.mjs";
import TokenService from "./token_service.mjs";
import QuestionService from "./questions_service.mjs";
import RouteDAO from "../data/routes_dao.mjs";
import ChallengeService from "./challenges_service.mjs";
import TeamDAO from "../data/team_dao.mjs";

export default class RouteService {
  static async connectDatabase(client) {
    try {
      await RouteDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addRoute(
    intro_video,
    total_time,
    finish_line_lat,
    finish_line_long
  ) {
    try {
      const createdOn = new Date();
      const deletedOn = null;

      const routeDocument = {
        intro_video: intro_video,
        total_time: total_time,
        finish_line_lat: finish_line_lat,
        finish_line_long: finish_line_long,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedRouteId = await RouteDAO.addRouteToDB(routeDocument);
      const route = await RouteDAO.getRouteByIDFromDB(addedRouteId);

      const filteredRoute = PatternUtil.filterParametersFromObject(route, [
        "created_on",
        "deleted_on",
      ]);

      return { route: filteredRoute };
    } catch (e) {
      return e.message;
    }
  }

  static async getRouteByID(routeId) {
    try {
      const existingRoute = await RouteDAO.getRouteByIDFromDB(routeId);
      if (!existingRoute) {
        return "No route found for this ID";
      } else {
        const filteredRoute = PatternUtil.filterParametersFromObject(
          existingRoute,
          ["created_on", "deleted_on"]
        );

        return filteredRoute;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getAllChallengesAndRoute(code) {
    try {
      if (code) {
        let [existingRoute, existingChallenge, existingTeam] =
          await Promise.all([
            RouteDAO.getAllRoutesFromDB(),
            ChallengeDAO.getAllChallengesFromDB(),
            TeamDAO.getTeamByTeamCode(code),
          ]);
        if (!existingTeam) {
          return "No such team exists with this ID";
        }

        if (existingChallenge) {
          existingChallenge = existingChallenge.map((challenge) => {
            return PatternUtil.filterParametersFromObject(challenge, [
              "created_on",
              "deleted_on",
            ]);
          });
        }

        // Create a map of route IDs to their corresponding challenges
        const routeChallengesMap = {};
        existingChallenge.forEach((challenge) => {
          if (!routeChallengesMap[challenge.route]) {
            routeChallengesMap[challenge.route] = [];
          }
          routeChallengesMap[challenge.route].push(challenge);
        });

        // Check active and completed challenges for the team
        const activeChallenge = existingChallenge.find(
          (challenge) =>
            challenge._id.toString() === existingTeam.active_challenge
        );
        const completedChallenges = existingTeam.completed_challenges.map(
          (challengeId) =>
            existingChallenge.find(
              (challenge) => challenge._id.toString() === challengeId
            )
        );
        const pendingChallenges = existingChallenge.filter(
          (challenge) =>
            !existingTeam.completed_challenges.includes(
              challenge._id.toString()
            ) && challenge._id.toString() !== existingTeam.active_challenge
        );

        // Map each route object to include active, completed, and pending challenges
        const routesWithChallenges = existingRoute.map((route) => {
          const filteredRoute = PatternUtil.filterParametersFromObject(route, [
            "created_on",
            "deleted_on",
          ]);
          filteredRoute.active_challenge = activeChallenge
            ? activeChallenge
            : null;
          filteredRoute.completed_challenges = completedChallenges
            ? completedChallenges
            : [];
          filteredRoute.pending_challenges = pendingChallenges
            ? pendingChallenges
            : [];
          return filteredRoute;
        });

        return {
          routes: routesWithChallenges,
        };
      } else {
        // Get routes and challenges concurrently
        const [existingRoute, existingChallenge] = await Promise.all([
          RouteDAO.getAllRoutesFromDB(),
          ChallengeDAO.getAllChallengesFromDB(),
        ]);

        // Create a map of route IDs to their corresponding challenges
        const routeChallengesMap = {};
        existingChallenge.forEach((challenge) => {
          if (!routeChallengesMap[challenge.route]) {
            routeChallengesMap[challenge.route] = [];
          }
          routeChallengesMap[challenge.route].push(challenge);
        });

        // Filter out unwanted parameters for each route
        const filteredRoutes = existingRoute.map((route) => {
          const filteredRoute = PatternUtil.filterParametersFromObject(route, [
            "created_on",
            "deleted_on",
          ]);
          // Attach challenges to their respective routes
          filteredRoute.challenges = routeChallengesMap[route._id] || [];
          return filteredRoute;
        });

        return { routes: filteredRoutes };
      }
    } catch (e) {
      return e.message;
    }
  }
}
