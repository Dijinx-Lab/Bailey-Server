import databaseConfig from "../config/database_config.mjs";
import { ObjectId } from "mongodb";

let admincon;

export default class AdminDAO {
  static async injectDB(conn) {
    if (admincon) {
      return;
    }
    try {
      admincon = conn.db(databaseConfig.database.dbName).collection("admins");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addAdminToDB(admin) {
    try {
      const insertionResult = await admincon.insertOne(admin);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add Admin: ${e}`);
      return null;
    }
  }

  static async getAdminByUsernameFromDB(name) {
    try {
      const admin = await admincon.findOne({ username: name });
      return admin;
    } catch (e) {
      console.error(`Unable to get admin by ID: ${e}`);
      return null;
    }
  }

  static async getAdminByIDFromDB(id) {
    try {
      const admin = await admincon.findOne({ _id: new ObjectId(id) });
      return admin;
    } catch (e) {
      console.error(`Unable to get admin by ID: ${e}`);
      return null;
    }
  }

  static async updateAdminPasswordInDB(email, newPassword) {
    try {
      const updateResult = await admincon.updateOne(
        { email },
        {
          $set: { password: newPassword },
        }
      );
      return true;
    } catch (e) {
      console.error(`Unable to get admin by ID: ${e}`);
      return null;
    }
  }

  static async updateAdminAccountInDB(admin) {
    try {
      const updateResult = await admincon.updateOne(
        { _id: admin._id },
        {
          $set: admin,
        }
      );
      return true;
    } catch (e) {
      console.error(`Unable to get admin by ID: ${e}`);
      return null;
    }
  }
}
