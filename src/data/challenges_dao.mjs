import { ObjectId } from "mongodb";
import databaseConfig from "../config/database_config.mjs";

let challengecon;

export default class ChallengeDAO {
  static async injectDB(conn) {
    if (challengecon) {
      return;
    }
    try {
      challengecon = conn.db(databaseConfig.database.dbName).collection("challenges");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addChallengeToDB(challenge) {
    try {
      const insertionResult = await challengecon.insertOne(challenge);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add a challenge: ${e}`);
      return null;
    }
  }

  static async getChallengeByIDFromDB(id) {
    try {
      const challenge = await challengecon.findOne({ _id: new ObjectId(id) });
      return challenge;
    } catch (e) {
      console.error(`Unable to get challenge by ID: ${e}`);
      return null;
    }
  }

  static async getChallengeByRouteFromDB(route) {
    try {
      const challenge = await challengecon.find({ route: new ObjectId(route) }).toArray();
      return challenge;
    } catch (e) {
      console.error(`Unable to get challenge by route: ${e}`);
      return null;
    }
  }
}