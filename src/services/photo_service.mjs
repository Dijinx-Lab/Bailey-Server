import TokenUtil from "../utility/token_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import AuthUtil from "../utility/auth_util.mjs";
// import EmailUtility from "../utility/email_util.mjs";
import PhotoDAO from "../data/photo_dao.mjs";
import UserService from "./user_service.mjs";
import UploadService from "./upload_service.mjs";
import { ObjectId } from "mongodb";
export default class PhotoService {
  static async connectDatabase(client) {
    try {
      await PhotoDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addPhotoInDB(
    token,
    upload_id,
  ) {
    try {    
        if (typeof upload_id !== 'string') {
            throw new Error('upload_id should be a string');
          }

      const createdOn = new Date();
      const deletedOn = null;
      let databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return "User with this token does not exists";
      }
      const photoDocument = {
        user_id: databaseUser._id,
        upload_id: upload_id,
        // role: "user",
        // token: authToken,
        // password: hashedPassword,
        // google_id: null,
        // apple_id: null,
        // last_signin_on: createdOn,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedPhoto = await PhotoDAO.addPhotoUrlToDB(photoDocument);

      const photoData = await PhotoDAO.getPhotoByIDFromDB(addedPhoto);

      const filteredPhoto = this.getFormattedPhoto(photoData);

    //   filteredUser.login_method = "email";

      return { photo: filteredPhoto };
    } catch (e) {
      return e.message;
    }
  }
  static getFormattedPhoto(rawPhoto) {
    const filteredPhoto = PatternUtil.filterParametersFromObject(rawPhoto, [
      "_id",
      "created_on",
      "deleted_on",
    ]);
    return filteredPhoto;
  }
  static async updateUploadId(token, _id,old_upload_id,upload_id) {
    try {
      // let databaseUser = await this.getUserFromToken(token);
      let retrievedPhoto = await PhotoDAO.getPhotoByIDFromDB(_id);
      const processedUpdateFields = UserService.convertToDotNotation({
        upload_id: upload_id,
      });
      await UploadService.deleteUpload(new ObjectId(old_upload_id))

      retrievedPhoto = await PhotoDAO.updateUploadidFieldByID(
        retrievedPhoto._id,
        processedUpdateFields
      );

      const updatedPhoto = await PhotoDAO.getPhotoByIDFromDB(retrievedPhoto._id);
      const filteredPhoto = this.getFormattedPhoto(updatedPhoto);

      return { photo: filteredPhoto };
    } catch (e) {
      return e.message;
    }
  }

  static async getUploadId(token, _id,) {
    try {
      // let databaseUser = await this.getUserFromToken(token);
      let retrievedPhoto = await PhotoDAO.getPhotoByIDFromDB(_id);
   

      // const updatedPhoto = await PhotoDAO.getPhotoByIDFromDB(retrievedPhoto._id);
      const filteredPhoto = this.getFormattedPhoto(retrievedPhoto);

      return { photo: filteredPhoto };
    } catch (e) {
      return e.message;
    }
  }
  static async getAllUploadId(token,) {
    try {
      // let databaseUser = await this.getUserFromToken(token);
      let retrievedPhoto = await PhotoDAO.getAllPhotosFromDB();
   
      if (!retrievedPhoto) {
        return "No Photos found";
      } else {
        for (let i = 0; i < retrievedPhoto.length; i++) {
          const filteredPrint = PatternUtil.filterParametersFromObject(
            retrievedPhoto[i],
            ["created_on", "deleted_on"]
          );

          retrievedPhoto[i] = filteredPrint;
        }
      // const updatedPhoto = await PhotoDAO.getPhotoByIDFromDB(retrievedPhoto._id);
      // const filteredPhoto = this.getFormattedPhoto(retrievedPhoto);

      return { photo: retrievedPhoto };
    }} catch (e) {
      return e.message;
    }
  }


}