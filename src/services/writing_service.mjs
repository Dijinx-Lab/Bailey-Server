import TokenUtil from "../utility/token_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import AuthUtil from "../utility/auth_util.mjs";
// import EmailUtility from "../utility/email_util.mjs";
import PhotoDAO from "../data/photo_dao.mjs";
import UserService from "./user_service.mjs";
import WritingDAO from "../data/writing_dao.mjs";
export default class WritingService {
  static async connectDatabase(client) {
    try {
      await WritingDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addWritingInDB(
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
      const writingDocument = {
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

      const addedWriting = await WritingDAO.addWritingToDB(writingDocument);

      const writingData = await WritingDAO.getWritingByIDFromDB(addedWriting);

      const filteredWriting = this.getFormattedWriting(writingData);

    //   filteredUser.login_method = "email";

      return { writing: filteredWriting };
    } catch (e) {
      return e.message;
    }
  }
  static getFormattedWriting(rawWriting) {
    const filteredWriting = PatternUtil.filterParametersFromObject(rawWriting, [
      "_id",
      "created_on",
      "deleted_on",
    ]);
    return filteredWriting;
  }
  static async updateUploadId(token, _id,upload_id) {
    try {
      // let databaseUser = await this.getUserFromToken(token);
      let retrievedWriting = await WritingDAO.getWritingByIDFromDB(_id);
      const processedUpdateFields = UserService.convertToDotNotation({
        upload_id: upload_id,
      });
      retrievedWriting = await WritingDAO.updateUploadidFieldByID(
        retrievedWriting._id,
        processedUpdateFields
      );

      const updatedWriting = await WritingDAO.getWritingByIDFromDB(retrievedWriting._id);
      const filteredWriting = this.getFormattedWriting(updatedWriting);

      return { writing: filteredWriting };
    } catch (e) {
      return e.message;
    }
  }

  static async getUploadId(token, _id,) {
    try {
      // let databaseUser = await this.getUserFromToken(token);
      let retrievedPhoto = await PhotoDAO.getPhotoByIDFromDB(_id);
   

      // const updatedPhoto = await PhotoDAO.getPhotoByIDFromDB(retrievedPhoto._id);
      const filteredPhoto = this.getFormattedWriting(retrievedPhoto);

      return { photo: filteredPhoto };
    } catch (e) {
      return e.message;
    }
  }
  static async getAllUploadId(token,) {
    try {
      // let databaseUser = await this.getUserFromToken(token);
      let retrievedWriting = await WritingDAO.getAllWritingFromDB();
   
      if (!retrievedWriting) {
        return "No Writings found";
      } else {
        for (let i = 0; i < retrievedWriting.length; i++) {
          const filteredWriting = PatternUtil.filterParametersFromObject(
            retrievedWriting[i],
            ["created_on", "deleted_on"]
          );

          retrievedWriting[i] = filteredWriting;
        }
      // const updatedPhoto = await PhotoDAO.getPhotoByIDFromDB(retrievedPhoto._id);
      // const filteredPhoto = this.getFormattedPhoto(retrievedPhoto);

      return { writing: retrievedWriting };
    }} catch (e) {
      return e.message;
    }
  }


}