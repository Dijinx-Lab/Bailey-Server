import TokenUtil from "../utility/token_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import AuthUtil from "../utility/auth_util.mjs";
// import EmailUtility from "../utility/email_util.mjs";
import PhotoDAO from "../data/photo_dao.mjs";
import UserService from "./user_service.mjs";
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

    // filteredPhoto.notifications_enabled =
    //   rawUser.fcm_token !== null && rawUser.fcm_token !== "x";
    return filteredPhoto;
  }


}