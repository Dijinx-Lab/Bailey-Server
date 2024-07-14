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
      console.error(`Unable to add photo: ${e}`);
      return null;
    }
  }
  static async getPhotoByIDFromDB(id) {
    try {
      const photo = await photocon.findOne({ _id: new ObjectId(id) });
      return photo;
    } catch (e) {
      console.error(`Unable to get photo by ID: ${e}`);
      return null;
    }
  }

  static async getAllPhotosFromDB(user_id) {
    try {
      const photos = await photocon
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
      const photo = await photocon.findOneAndUpdate(
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

  static async deletePhotosByUserID(user_id) {
    try {
      const result = await photocon.deleteMany({ user_id: user_id });
      return result.deletedCount > 0;
    } catch (e) {
      throw new Error(`Unable to delete photo: ${e}`);
    }
  }

  static async deletePhotosByID(id) {
    try {
      const result = await photocon.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (e) {
      throw new Error(`Unable to delete photo: ${e}`);
    }
  }

  static async getAnyFirstPhoto(user_id) {
    try {
      const print = await photocon.findOne({
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
