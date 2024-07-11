import databaseConfig from "../config/database_config.mjs";
import { ObjectId } from "mongodb";
let uploadConn;

export default class UploadDAO {
  static async injectDB(conn) {
    if (uploadConn) {
      return;
    }
    try {
      uploadConn = conn
        .db(databaseConfig.database.dbName)
        .collection("uploads");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addUploadToDB(upload) {
    try {
      const insertionResult = await uploadConn.insertOne(upload);
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

  static async deleteUploadByID(uploadId) {
    try {
      const deletedUser = await uploadConn.deleteOne({
        _id: new ObjectId(uploadId),
      });

      if (!deletedUser || deletedUser.deletedCount === 0) {
        throw new Error("Upload not found or already deleted");
      }

      return deletedUser;
    } catch (error) {
      throw new Error(`Failed to delete upload: ${error.message}`);
    }
  }

  static async getUploadByIDFromDB(id) {
    try {
      const user = await uploadConn.findOne({ _id: id });
      return user;
    } catch (e) {
      console.error(`Unable to get user by ID: ${e}`);
      return null;
    }
  }
}
