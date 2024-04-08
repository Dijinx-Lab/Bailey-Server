import { ObjectId } from "mongodb";
import databaseConfig from "../config/database_config.mjs";

let teamcon;

export default class TeamDAO {
  static async injectDB(conn) {
    if (teamcon) {
      return;
    }
    try {
      teamcon = conn.db(databaseConfig.database.dbName).collection("teams");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addTeamToDB(team) {
    try {
      const insertionResult = await teamcon.insertOne(team);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add a team: ${e}`);
      return null;
    }
  }

  static async getTeamByIDFromDB(id) {
    try {
      const team = await teamcon.findOne({ _id: new ObjectId(id) });
      return team;
    } catch (e) {
      console.error(`Unable to get team by ID: ${e}`);
      return null;
    }
  }

  static async getTeamByTeamCode(team_code) {
    try {
      const team = await teamcon.findOne({ team_code: team_code });
      return team;
    } catch (e) {
      console.error(`Unable to get team by Team Code: ${e}`);
      return null;
    }
  }

  static async getAllTeamsFromDB(sortField = "score", sortOrder = -1) {
    try {
      let sortOptions = {};
      sortOptions[sortField] = sortOrder;

      const team = await teamcon.find().sort(sortOptions).toArray();
      return team;
    } catch (e) {
      console.error(`Unable to get all teams: ${e}`);
      return null;
    }
  }

  static async updateTeamInDB(team) {
    try {
      const updateResult = await teamcon.updateOne(
        { _id: new ObjectId(team._id) },
        {
          $set: team,
        }
      );
      return true;
    } catch (e) {
      console.error(`Unable to get team by ID: ${e}`);
      return null;
    }
  }
}
