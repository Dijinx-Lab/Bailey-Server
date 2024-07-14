import TokenUtil from "../utility/token_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import AuthUtil from "../utility/auth_util.mjs";
// import EmailUtility from "../utility/email_util.mjs";
import PhotoDAO from "../data/photo_dao.mjs";
import UserService from "./user_service.mjs";
import UploadService from "./upload_service.mjs";
import { ObjectId } from "mongodb";
import AwsUtil from "../utility/aws_util.mjs";
export default class PhotoService {
  static async connectDatabase(client) {
    try {
      await PhotoDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addPhotoInDB(token, upload_id) {
    try {
      const createdOn = new Date();
      const deletedOn = null;
      let databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return "User with this token does not exists";
      }
      const uploadObjId = new ObjectId(upload_id);
      const photoDocument = {
        user_id: databaseUser._id,
        upload_id: uploadObjId,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedPhoto = await PhotoDAO.addPhotoUrlToDB(photoDocument);

      const photoData = await PhotoDAO.getPhotoByIDFromDB(addedPhoto);

      let filteredPhoto = this.getFormattedPhoto(photoData);
      filteredPhoto = await PatternUtil.replaceIdWithUpload(filteredPhoto);

      return { photo: filteredPhoto };
    } catch (e) {
      return e.message;
    }
  }

  static getFormattedPhoto(rawPhoto) {
    const filteredPhoto = PatternUtil.filterParametersFromObject(rawPhoto, [
      "user_id",
      "created_on",
      "deleted_on",
    ]);
    return filteredPhoto;
  }

  static async deletePhoto(token, photoId) {
    try {
      const photoObjId = new ObjectId(photoId);
      const [databaseUser, databasePhoto] = await Promise.all([
        UserService.getUserFromToken(token),
        PhotoDAO.getPhotoByIDFromDB(photoObjId),
      ]);

      if (!databaseUser) {
        return "User with this token does not exist";
      }
      if (!databasePhoto) {
        return "Photo with this id does not exist";
      }
      if (databasePhoto.user_id.toString() !== databaseUser._id.toString()) {
        return "You do not have any photo with this id";
      }
      const oldUploadId = databasePhoto.upload_id;

      let retrievedPhotos = await PhotoDAO.deletePhotosByID(photoObjId);

      await UploadService.deleteUpload(oldUploadId);

      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async deleteAllUserPhotos(userId) {
    try {
      const databasePhotos = await PhotoDAO.getAllPhotosFromDB(userId);

      if (!databasePhotos || databasePhotos.length === 0) {
        return {};
      }

      let retrievedPhotos = await PhotoDAO.deletePhotosByUserID(userId);

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

  static async getAllPhotos(token) {
    try {
      let databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return "User with this token does not exist";
      }

      let retrievedPhotos = await PhotoDAO.getAllPhotosFromDB(databaseUser._id);

      if (!retrievedPhotos || retrievedPhotos.length === 0) {
        return { photos: [] };
      } else {
        const retrievedPhotosPromises = retrievedPhotos.map(async (photo) => {
          let filteredPrint = this.getFormattedPhoto(photo);
          filteredPrint = await PatternUtil.replaceIdWithUpload(filteredPrint);
          return filteredPrint;
        });
        retrievedPhotos = await Promise.all(retrievedPhotosPromises);

        return { photos: retrievedPhotos };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async checkPhotosAddedByUserId(userId) {
    try {
      let retrievedPrint = await PhotoDAO.getAnyFirstPhoto(userId);

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
