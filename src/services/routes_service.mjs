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
import TimingService from "./timing_service.mjs";
import UtilService from "./util_service.mjs";

export default class RouteService {
  static async connectDatabase(client) {
    try {
      await RouteDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addRoute(
    intro_message,
    outro_message,
    intro_video,
    outro_video,
    total_time
  ) {
    try {
      const createdOn = new Date();
      const deletedOn = null;

      const routeDocument = {
        intro_message: intro_message,
        outro_message: outro_message,
        intro_video: intro_video,
        outro_video: outro_video,
        total_time: total_time,
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

  static async updateRouteDetails(
    routeId,
    intro_message,
    outro_message,
    intro_video,
    outro_video,
    total_time,
    terms_and_conditions,
    privacy_policy
  ) {
    try {
      let existingRoute = await RouteDAO.getRouteByIDFromDB(routeId);
      if (!existingRoute) {
        return "No route found for this ID";
      }

      if (outro_message) {
        existingRoute.outro_message = outro_message;
      }
      if (intro_message) {
        existingRoute.intro_message = intro_message;
      }
      if (intro_video) {
        existingRoute.intro_video = intro_video;
      }

      if (outro_video) {
        existingRoute.outro_video = outro_video;
      }

      if (total_time) {
        existingRoute.total_time = Number(total_time);
        console.log(typeof existingRoute.total_time);
        if (isNaN(existingRoute.total_time)) {
          return "Invalid value, please enter a valid number of minutes";
        }
      }

      if (terms_and_conditions) {
        await UtilService.apiUpdateFile(terms_and_conditions, "terms");
      }

      if (privacy_policy) {
        await UtilService.apiUpdateFile(privacy_policy, "privacy");
      }

      if (
        intro_video ||
        outro_video ||
        total_time ||
        outro_message ||
        intro_message
      ) {
        const updateResult = await RouteDAO.updateRouteInDB(existingRoute);
      }

      return await this.getRouteSettings(routeId);
    } catch (e) {
      return e.message;
    }
  }

  static async getRouteSettingsForAdmin(routeId) {
    return await this.getRouteSettings(routeId);
  }

  static async getRouteSettings(routeId) {
    try {
      const existingRoute = await RouteDAO.getRouteByIDFromDB(routeId);
      const privacyData = await UtilService.apiGetFileContent("privacy");
      const termsData = await UtilService.apiGetFileContent("terms");
      if (!existingRoute) {
        return "No route found for this ID";
      } else {
        const settings = {
          total_time: existingRoute.total_time,
          video_table: [
            {
              title: "Welcome",
              message: existingRoute.intro_message,
              video: existingRoute.intro_video,
            },
            {
              title: "Goodbye",
              message: existingRoute.outro_message,
              video: existingRoute.outro_video,
            },
          ],
          privacy_policy: privacyData,
          terms_and_conditions: termsData,
        };

        return settings;
      }
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
        let [routes, existingChallenge, existingTeam] = await Promise.all([
          RouteDAO.getAllRoutesFromDB(),
          ChallengeDAO.getAllChallengesFromDB(),
          TeamDAO.getTeamByTeamCode(code),
        ]);

        if (!routes || routes.length === 0) {
          return { routes: [] };
        }

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

        let formattedRoutes = [];

        for (const existingRoute of routes) {
          const formattedRoute = await this.getFormattedRoute(
            existingRoute,
            existingChallenge,
            existingTeam
          );

          formattedRoutes.push(formattedRoute);
        }

        return { routes: formattedRoutes };
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

  static async getFormattedRoute(route, existingChallenges, existingTeam) {
    if (!existingTeam) {
      throw new Error("No such team exists with this ID");
    }

    // Filter challenges for the specific route
    const routeChallenges = existingChallenges.filter(
      (challenge) => challenge.route.toString() === route._id.toString()
    );

    // Check active and completed challenges for the team
    const activeChallenge = routeChallenges.find(
      (challenge) => challenge._id.toString() === existingTeam.active_challenge
    );
    const completedChallenges = existingTeam.completed_challenges.map(
      (challengeId) =>
        routeChallenges.find(
          (challenge) => challenge._id.toString() === challengeId
        )
    );
    const pendingChallenges = routeChallenges.filter(
      (challenge) =>
        !existingTeam.completed_challenges.includes(challenge._id.toString()) &&
        challenge._id.toString() !== existingTeam.active_challenge
    );

    // Prepare the route object with associated challenges
    const formattedRoute = PatternUtil.filterParametersFromObject(route, [
      "created_on",
      "deleted_on",
    ]);
    formattedRoute.active_challenge = activeChallenge ? activeChallenge : null;
    formattedRoute.completed_challenges = completedChallenges
      ? completedChallenges
      : [];
    formattedRoute.pending_challenges = pendingChallenges
      ? pendingChallenges
      : [];

    let timings = null;

    const timingsInfo = await TimingService.getTimingDetails(
      existingTeam.team_code,
      route._id.toString(),
      route.total_time
    );

    if (timingsInfo) {
      timings = timingsInfo.timings;
    }
    formattedRoute.timings = timings;

    return formattedRoute;
  }

  static async startRouteForTeam(routeId, code) {
    try {
      let [existingRoute, existingChallenge, existingTeam] = await Promise.all([
        RouteDAO.getRouteByIDFromDB(routeId),
        ChallengeDAO.getAllChallengesFromDB(),
        TeamDAO.getTeamByTeamCode(code),
      ]);

      const timingsInfo = await TimingService.getTimingDetails(
        existingTeam.team_code,
        existingRoute._id.toString(),
        existingRoute.total_time
      );

      if (timingsInfo) {
        return "Already started this route";
      }

      if (!existingRoute) {
        return "No route found for this ID";
      }

      if (existingChallenge) {
        existingChallenge = existingChallenge.map((challenge) => {
          return PatternUtil.filterParametersFromObject(challenge, [
            "created_on",
            "deleted_on",
          ]);
        });
      }

      const timings = await TimingService.addTiming(
        existingTeam.fcm_token,
        code,
        routeId,
        existingRoute.total_time
      );

      const route = await this.getFormattedRoute(
        existingRoute,
        existingChallenge,
        existingTeam
      );

      return { route: route };
    } catch (e) {
      console.log(e);
      return e.message;
    }
  }

  static async endRouteForTeam(routeId, team_code) {
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

      let timingsInfo = await TimingService.getTimingDetails(
        team_code,
        existingRoute._id.toString(),
        existingRoute.total_time
      );

      if (!timingsInfo) {
        return "This route hasn't been started yet";
      }
      const startTime = timingsInfo.timings.start_time;
      let endTime = timingsInfo.timings.end_time;

      if (timingsInfo.timings.end_time === null) {
        await TimingService.addEndTime(team_code, existingRoute._id.toString());
        timingsInfo = await TimingService.getTimingDetails(
          team_code,
          existingRoute._id.toString(),
          existingRoute.total_time
        );
        endTime = timingsInfo.timings.end_time;
      }

      existingRoute.time_taken = (endTime - startTime) / (1000 * 60);

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
