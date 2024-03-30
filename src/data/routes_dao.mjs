import { ObjectId } from "mongodb";
import databaseConfig from "../config/database_config.mjs";

let routescon;

export default class RouteDAO {
  static async injectDB(conn) {
    if (routescon) {
      return;
    }
    try {
      routescon = conn.db(databaseConfig.database.dbName).collection("routes");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addRouteToDB(route) {
    try {
      const insertionResult = await routescon.insertOne(route);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add a route: ${e}`);
      return null;
    }
  }

  static async getRouteByIDFromDB(id) {
    try {
      const route = await routescon.findOne({ _id: new ObjectId(id) });
      return route;
    } catch (e) {
      console.error(`Unable to get route by ID: ${e}`);
      return null;
    }
  }

  static async getAllRoutesFromDB() {
    try {
      const route = await routescon.find().toArray();
      return route;
    } catch (e) {
      console.error(`Unable to get all routes: ${e}`);
      return null;
    }
  }
}