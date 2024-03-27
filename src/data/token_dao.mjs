import databaseConfig from "../config/database_config.mjs";

let tokencon;

export default class TokenDAO {
  static async injectDB(conn) {
    if (tokencon) {
      return;
    }
    try {
      tokencon = conn.db(databaseConfig.database.dbName).collection("tokens");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addTokenToDB(token) {
    try {
      const insertionResult = await tokencon.insertOne(token);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add User: ${e}`);
      return null;
    }
  }

  static async getTokenFromDB(token) {
    try {
      const tokenObject = await tokencon.findOne({ token: token });

      return tokenObject;
    } catch (e) {
      console.error(`Unable to get token: ${e}`);
      return null;
    }
  }

  static async deleteTokenFromDB(token) {
    try {
      
      const isDel = await tokencon.deleteOne({ token: token });
      return true;
    } catch (e) {
      console.error(`Unable to get token: ${e}`);
      return null;
    }
  }
}
