import databaseConfig from "../config/database_config.mjs";
import { ObjectId } from "mongodb";
let photocon;

export default class PhotoDAO {
  static async injectDB(conn) {
    if (photocon) {
      return;
    }
    try {
      photocon = conn.db(databaseConfig.database.dbName).collection("photos");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }
  static async addPhotoUrlToDB(photo) {
    try {
      const insertionResult = await photocon.insertOne(photo);
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
  static async getPhotoByIDFromDB(id) {
    try {
      const photo = await photocon.findOne({ _id: id });
      return photo;
    } catch (e) {
      console.error(`Unable to get user by ID: ${e}`);
      return null;
    }
  }
}