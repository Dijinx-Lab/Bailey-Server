import PatternUtil from "../utility/pattern_util.mjs";
import UserService from "./user_service.mjs";
import WritingDAO from "../data/writing_dao.mjs";
import UploadService from "./upload_service.mjs";
import { ObjectId } from "mongodb";

export default class WritingService {
  static async connectDatabase(client) {
    try {
      await WritingDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addWritingInDB(token, upload_id, session_id) {
    try {
      let databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return "User with this token does not exists";
      }
      const uploadObjId = new ObjectId(upload_id);
      const sessionObjId = new ObjectId(session_id);
      const createdOn = new Date();
      const deletedOn = null;
      const writingDocument = {
        user_id: databaseUser._id,
        session_id: sessionObjId,
        upload_id: uploadObjId,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedWriting = await WritingDAO.addWritingToDB(writingDocument);

      const writingData = await WritingDAO.getWritingByIDFromDB(addedWriting);

      let filteredWriting = this.getFormattedWriting(writingData);

      filteredWriting = await PatternUtil.replaceIdWithUpload(filteredWriting);

      return { handwriting: filteredWriting };
    } catch (e) {
      return e.message;
    }
  }

  static getFormattedWriting(rawWriting) {
    const filteredWriting = PatternUtil.filterParametersFromObject(rawWriting, [
      "user_id",
      "created_on",
      "deleted_on",
    ]);
    return filteredWriting;
  }

  static async getAllHandwritings(id) {
    try {
      // let databaseUser = await UserService.getUserFromToken(id);
      // if (!databaseUser) {
      //   return "User with this token does not exist";
      // }
      let retrievedWritings = await WritingDAO.getAllWritingFromDB(
        new ObjectId(id)
      );

      if (!retrievedWritings || retrievedWritings.length === 0) {
        return { handwritings: [] };
      } else {
        const retrievedWritingsPromises = retrievedWritings.map(
          async (writing) => {
            let filteredWriting = this.getFormattedWriting(writing);
            filteredWriting = await PatternUtil.replaceIdWithUpload(
              filteredWriting
            );
            return filteredWriting;
          }
        );
        retrievedWritings = await Promise.all(retrievedWritingsPromises);

        return { handwritings: retrievedWritings };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async deleteWriting(token, writingId) {
    try {
      const writingObjId = new ObjectId(writingId);
      const [databaseUser, databaseWriting] = await Promise.all([
        UserService.getUserFromToken(token),
        WritingDAO.getWritingByIDFromDB(writingObjId),
      ]);

      if (!databaseUser) {
        return "User with this token does not exist";
      }
      if (!databaseWriting) {
        return "Photo with this id does not exist";
      }
      if (databaseWriting.user_id.toString() !== databaseUser._id.toString()) {
        return "You do not have any photo with this id";
      }
      const oldUploadId = databaseWriting.upload_id;

      let retrievedPhotos = await WritingDAO.deleteWritingByID(writingObjId);

      await UploadService.deleteUpload(oldUploadId);

      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async deleteAllUserWritings(userId) {
    try {
      const databasePhotos = await WritingDAO.getAllWritingFromDB(userId);

      if (!databasePhotos || databasePhotos.length === 0) {
        return {};
      }

      let retrievedPhotos = await WritingDAO.deleteAllUserWritings(userId);

      const deleteUploadPromises = databasePhotos.map(async (photo) => {
        const oldUploadId = photo.upload_id;
        await UploadService.deleteUpload(oldUploadId);
      });

      await Promise.all(deleteUploadPromises);

      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async deleteAllSessionWritings(sessionId) {
    try {
      let objId = sessionId;
      if (typeof objId === "string") {
        objId = new ObjectId(sessionId);
      }
      const databasePhotos = await WritingDAO.getAllWritingFromDB(objId);

      if (!databasePhotos || databasePhotos.length === 0) {
        return {};
      }

      let retrievedPhotos = await WritingDAO.deleteWritingsBySessionId(objId);

      const deleteUploadPromises = databasePhotos.map(async (photo) => {
        const oldUploadId = photo.upload_id;
        await UploadService.deleteUpload(oldUploadId);
      });

      await Promise.all(deleteUploadPromises);

      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async checkWritingAddedBySessionId(userId) {
    try {
      let retrievedPrint = await WritingDAO.getAnyFirstWriting(userId);

      if (!retrievedPrint) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      return e.message;
    }
  }
}
