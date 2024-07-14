import databaseConfig from "../config/database_config.mjs";
import { ObjectId } from "mongodb";
let writingcon;

export default class WritingDAO {
  static async injectDB(conn) {
    if (writingcon) {
      return;
    }
    try {
      writingcon = conn
        .db(databaseConfig.database.dbName)
        .collection("writings");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }
  static async addWritingToDB(photo) {
    try {
      const insertionResult = await writingcon.insertOne(photo);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add photo: ${e}`);
      return null;
    }
  }
  static async getWritingByIDFromDB(id) {
    try {
      const photo = await writingcon.findOne({ _id: new ObjectId(id) });
      return photo;
    } catch (e) {
      console.error(`Unable to get photo by ID: ${e}`);
      return null;
    }
  }

  static async getAllWritingFromDB(user_id) {
    try {
      const photos = await writingcon
        .find({
          user_id: user_id,
          deleted_on: { $eq: null },
        })
        .sort({ created_on: 1 })
        .toArray();
      return photos;
    } catch (e) {
      console.error(`Unable to get photos by ID: ${e}`);
      return null;
    }
  }

  static async updateUploadidFieldByID(id, fieldsToUpdate) {
    try {
      const photo = await writingcon.findOneAndUpdate(
        { _id: id },
        { $set: fieldsToUpdate },
        { new: true }
      );
      return photo;
    } catch (e) {
      console.error(`Unable to update photo field: ${e}`);
      return null;
    }
  }

  static async deleteWritingByID(id) {
    try {
      const result = await writingcon.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (e) {
      throw new Error(`Unable to delete writing: ${e}`);
    }
  }

  static async deleteWritingsByUserID(user_id) {
    try {
      const result = await writingcon.deleteMany({ user_id: user_id });
      return result.deletedCount > 0;
    } catch (e) {
      throw new Error(`Unable to delete writing: ${e}`);
    }
  }

  static async getAnyFirstWriting(user_id) {
    try {
      const print = await writingcon.findOne({
        user_id: user_id,
        deleted_on: { $eq: null },
      });

      return print;
    } catch (e) {
      console.error(`Unable to get print by ID: ${e}`);
      return null;
    }
  }
}
