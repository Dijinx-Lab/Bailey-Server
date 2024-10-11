import databaseConfig from "../config/database_config.mjs";
let sessionConn;

export default class SessionDAO {
  static async injectDB(conn) {
    if (sessionConn) {
      return;
    }
    try {
      sessionConn = conn
        .db(databaseConfig.database.dbName)
        .collection("sessions");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }
  static async addSessionToDB(print) {
    try {
      const insertionResult = await sessionConn.insertOne(print);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add session: ${e}`);
      return null;
    }
  }
  static async getSessionByIDFromDB(id) {
    try {
      const print = await sessionConn.findOne({ _id: id });
      return print;
    } catch (e) {
      console.error(`Unable to get session by ID: ${e}`);
      return null;
    }
  }
  static async getAllSessions(user_id) {
    try {
      const print = await sessionConn
        .find({ user_id: user_id, deleted_on: { $eq: null } })
        .toArray();

      return print;
    } catch (e) {
      console.error(`Unable to get session by ID: ${e}`);
      return null;
    }
  }

  static async deleteSessionByID(id) {
    try {
      const result = await sessionConn.deleteOne({ _id: id });

      return result.deletedCount > 0;
    } catch (e) {
      throw new Error(`Unable to delete photo: ${e}`);
    }
  }

  static async deleteSessionByUserID(user_id) {
    try {
      const result = await sessionConn.deleteMany({ user_id: user_id });
      return result.deletedCount > 0;
    } catch (e) {
      throw new Error(`Unable to delete prints: ${e}`);
    }
  }
}
