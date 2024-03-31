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
import QuestionDAO from "../data/questions_dao.mjs";
import AnswerDAO from "../data/answers_dao.mjs";

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
      const start_time = null;
      const end_time = null;

      const routeDocument = {
        intro_video: intro_video,
        total_time: total_time,
        finish_line_lat: finish_line_lat,
        finish_line_long: finish_line_long,
        start_time: start_time,
        end_time: end_time,
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

  static async setStartTime(routeId) {
    try {
      const existingRoute = await RouteDAO.getRouteByIDFromDB(routeId);
      if (!existingRoute) {
        return "No route found for this ID";
      }

      existingRoute.start_time = new Date();

      const updateResult = await RouteDAO.updateRouteInDB(existingRoute);

      if (updateResult) {
        return {};
      } else {
        return "Failed to update the route";
      }
    } catch (e) {
      return e.message;
    }
  }

  static async markRouteComplete(routeId, team_code) {
    try {
      const [existingRoute, existingChallenge, existingTeam] =
        await Promise.all([
          RouteDAO.getRouteByIDFromDB(routeId),
          ChallengeDAO.getChallengeByRouteFromDB(routeId),
          TeamDAO.getTeamByTeamCode(team_code),
        ]);

      if (!existingRoute) {
        return "No route found for this ID";
      }

      if (!existingChallenge) {
        return "No challenges found for this route";
      }

      existingRoute.end_time = new Date();
      existingRoute.total_time =
        (existingRoute.end_time - existingRoute.start_time) / 1000;

      let completed_challenges_no = 0;

      for (const challenge of existingChallenge) {
        for (const challengeId of existingTeam.completed_challenges) {
          if (challenge._id.toString() === challengeId.toString()) {
            completed_challenges_no++;
            break;
          }
        }
      }

      existingRoute.completed_challenges = completed_challenges_no;
      existingRoute.total_challenges = existingChallenge.length;

      let completed_questions_no = 0;
      let total_questions_no = 0;
      let total_score = 0;

      const questionPromises = existingChallenge.map((challenge) =>
        QuestionDAO.getQuestionsByChallengeFromDB(challenge._id)
      );

      const questionsByChallenge = await Promise.all(questionPromises);
      const allQuestions = questionsByChallenge.flat();
      total_questions_no += allQuestions.length;

      const answeredQuestionPromises = allQuestions.map((question) =>
        AnswerDAO.getAnswerByQuestionFromDB(question._id)
      );

      const answeredQuestions = await Promise.all(answeredQuestionPromises);

      completed_questions_no = answeredQuestions.filter((answer) => {
        if (answer) {
          completed_questions_no++;
          total_score += answer.score;

          return true;
        }
        return false;
      }).length;

      existingRoute.total_questions = total_questions_no;
      existingRoute.answered_questions = completed_questions_no;
      existingRoute.total_score = total_score;

      const filteredRoute = PatternUtil.filterParametersFromObject(
        existingRoute,
        ["created_on", "deleted_on"]
      );

      return filteredRoute;
    } catch (e) {
      return e.message;
    }
  }
}
