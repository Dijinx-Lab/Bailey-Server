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
      if (typeof upload_id !== "string") {
        throw new Error("upload_id should be a string");
      }

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

  // static async updateUploadId(token, _id, old_upload_id, upload_id) {
  //   try {
  //     // let databaseUser = await this.getUserFromToken(token);
  //     let retrievedPhoto = await PhotoDAO.getPhotoByIDFromDB(_id);
  //     const processedUpdateFields = UserService.convertToDotNotation({
  //       upload_id: upload_id,
  //     });
  //     await UploadService.deleteUpload(new ObjectId(old_upload_id));

  //     retrievedPhoto = await PhotoDAO.updateUploadidFieldByID(
  //       retrievedPhoto._id,
  //       processedUpdateFields
  //     );

  //     const updatedPhoto = await PhotoDAO.getPhotoByIDFromDB(
  //       retrievedPhoto._id
  //     );
  //     const filteredPhoto = this.getFormattedPhoto(updatedPhoto);

  //     return { photo: filteredPhoto };
  //   } catch (e) {
  //     return e.message;
  //   }
  // }

  // static async getUploadId(token, _id) {
  //   try {
  //     // let databaseUser = await this.getUserFromToken(token);
  //     let retrievedPhoto = await PhotoDAO.getPhotoByIDFromDB(_id);

  //     // const updatedPhoto = await PhotoDAO.getPhotoByIDFromDB(retrievedPhoto._id);
  //     const filteredPhoto = this.getFormattedPhoto(retrievedPhoto);

  //     return { photo: filteredPhoto };
  //   } catch (e) {
  //     return e.message;
  //   }
  // }

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
      const deleteFromAWS = await AwsUtil.deleteFromS3(databasePhoto.key);
      let retrievedPhotos = await PhotoDAO.deletePhotosByID(photoObjId);

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
}
