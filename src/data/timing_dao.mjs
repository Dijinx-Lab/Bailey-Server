import databaseConfig from "../config/database_config.mjs";
import { ObjectId } from "mongodb";

let timingcon;

export default class TimingDAO {
  static async injectDB(conn) {
    if (timingcon) {
      return;
    }
    try {
      timingcon = conn.db(databaseConfig.database.dbName).collection("timings");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addTimingToDB(user) {
    try {
      const insertionResult = await timingcon.insertOne(user);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add Timing: ${e}`);
      return null;
    }
  }

  static async getTimingByRouteIDAndTeamCodeFromDB(teamCode, routeId) {
    try {
      const user = await timingcon.findOne({
        route_id: routeId,
        team_code: teamCode,
      });

      return user;
    } catch (e) {
      console.error(`Unable to get user by ID: ${e}`);
      return null;
    }
  }

  static async getTimingByTeamCodeFromDB(teamCode) {
    try {
      const user = await timingcon.findOne({
        team_code: teamCode,
      });

      return user;
    } catch (e) {
      console.error(`Unable to get user by ID: ${e}`);
      return null;
    }
  }

  static async updateTimingInDB(timing) {
    try {
      const updateResult = await timingcon.updateOne(
        { _id: new ObjectId(timing._id) },
        {
          $set: timing,
        }
      );
      return true;
    } catch (e) {
      console.error(`Unable to get team by ID: ${e}`);
      return null;
    }
  }

  static async getTimingByTeamCodeFromDB(teamCode) {
    try {
      const user = await timingcon.findOne({
        team_code: teamCode,
      });

      return user;
    } catch (e) {
      console.error(`Unable to get team by code: ${e}`);
      return null;
    }
  }
}
