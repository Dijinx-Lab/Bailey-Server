import ChallengeDAO from "../data/challenges_dao.mjs";
import { ObjectId } from "mongodb";
import PatternUtil from "../utility/pattern_util.mjs";
import RouteService from "./routes_service.mjs";
import RouteDAO from "../data/routes_dao.mjs";

export default class ChallengeService {
  static async connectDatabase(client) {
    try {
      await ChallengeDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addChallenge(
    name,
    difficulty,
    longitude,
    latitude,
    route,
    description
  ) {
    try {
      const createdOn = new Date();
      const deletedOn = null;

      const new_route_id = new ObjectId(route);

      const chalDocument = {
        name: name,
        difficulty: difficulty,
        longitude: longitude,
        latitude: latitude,
        questions: 0,
        total_score: 0,
        route: new_route_id,
        description: description,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedChalId = await ChallengeDAO.addChallengeToDB(chalDocument);
      const challenge = await ChallengeDAO.getChallengeByIDFromDB(addedChalId);

      const filteredChallenge = PatternUtil.filterParametersFromObject(
        challenge,
        ["created_on", "deleted_on"]
      );

      return { challenge: filteredChallenge };
    } catch (e) {
      return e.message;
    }
  }

  static async getChallengeByID(chalId) {
    try {
      const existingChallenge = await ChallengeDAO.getChallengeByIDFromDB(
        chalId
      );
      if (!existingChallenge) {
        return "No challenge found for this ID";
      } else {
        if (existingChallenge.route != null) {
          const chalResponse = await RouteService.getRouteByID(
            existingChallenge.route
          );
          if (typeof chalResponse !== "string") {
            existingChallenge.route = chalResponse;
          }
        }
        const filteredChallenge = PatternUtil.filterParametersFromObject(
          existingChallenge,
          ["created_on", "deleted_on"]
        );
        return filteredChallenge;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getChallengesByRoute(routeId) {
    try {
      const existingChallenge = await ChallengeDAO.getChallengeByRouteFromDB(
        routeId
      );
      if (!existingChallenge) {
        return "No challenge found for this route";
      } else {
        for (let i = 0; i < existingChallenge.length; i++) {
          if (existingChallenge[i].route != null) {
            const chalResponse = await RouteService.getRouteByID(
              existingChallenge[i].route
            );
            if (typeof chalResponse !== "string") {
              existingChallenge[i].route = chalResponse;
            }
          }
          const filteredChallenge = PatternUtil.filterParametersFromObject(
            existingChallenge[i],
            ["created_on", "deleted_on"]
          );
          existingChallenge[i] = filteredChallenge;
        }
        return existingChallenge;
      }
    } catch (e) {
      return e.message;
    }
  }
}
