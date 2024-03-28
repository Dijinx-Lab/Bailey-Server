import ChallengeDAO from "../data/challenges_dao.mjs";
import { ObjectId } from "mongodb";
import AuthUtil from "../utility/auth_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TokenUtil from "../utility/token_util.mjs";
import TokenService from "./token_service.mjs";
import QuestionService from "./questions_service.mjs";
import RouteDAO from "../data/routes_dao.mjs";
import ChallengeService from "./challenges_service.mjs";

export default class RouteService {
  static async connectDatabase(client) {
    try {
      await RouteDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addRoute(intro_video, challenges, total_time) {
    try {
      const createdOn = new Date();
      const deletedOn = null;

      const challengeIds = challenges.map(challenge => new ObjectId(challenge));

      const routeDocument = {
        intro_video: intro_video,
        total_time: total_time,
        challenges: challengeIds,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedRouteId = await RouteDAO.addRouteToDB(routeDocument);
      const route = await RouteDAO.getRouteByIDFromDB(addedRouteId);

      return { route: route };
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
        if (existingRoute.challenges != null) {
          for (let i = 0; i < existingRoute.challenges.length; i++) {
            const quesResponse = await ChallengeService.getChallengeByID(existingRoute.challenges[i]);
            existingRoute.challenges[i] = quesResponse;
          }
        }
        return existingRoute;
      }
    } catch (e) {
      return e.message;
    }
  }
}