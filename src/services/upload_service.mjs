import UploadDAO from "../data/upload_dao.mjs";
import path from "path";
import AwsUtil from "../utility/aws_util.mjs";
import UserService from "./user_service.mjs";
import PatternUtil from "../utility/pattern_util.mjs";

export default class UploadService {
  static async connectDatabase(client) {
    try {
      await UploadDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async getUploadById(uploadId) {
    try {
      let databaseUpload = await UploadDAO.getUploadByIDFromDB(uploadId);
      databaseUpload = this.getFormattedUpload(databaseUpload);
      return databaseUpload;
    } catch (e) {
      return e.message;
    }
  }

  static async addUpload(file, fileName, folder, token) {
    try {
      const databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return "No user found";
      }
      const createdOn = new Date();
      const deletedOn = null;
      // const filename = createdOn.toISOString().replace(/[:.]/g, "-");
      const ext = path.extname(file.originalname);

      const formattedKey = folder
        ? `${folder}/${fileName}${ext}`
        : `${fileName}${ext}`;

      const access_url = await AwsUtil.uploadToS3(file, formattedKey);

      const document = {
        user_id: databaseUser._id,
        access_url: access_url,
        extension: ext,
        file_name: fileName,
        key: formattedKey,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedUploadId = await UploadDAO.addUploadToDB(document);

      let addedUpload = await UploadDAO.getUploadByIDFromDB(addedUploadId);

      addedUpload = this.getFormattedUpload(addedUpload);

      return { upload: addedUpload };
    } catch (e) {
      return e.message;
    }
  }

  static getFormattedUpload(rawUpload) {
    const filteredPhoto = PatternUtil.filterParametersFromObject(rawUpload, [
      "user_id",
      "created_on",
      "deleted_on",
    ]);
    return filteredPhoto;
  }

  static async deleteUpload(uploadId) {
    try {
      const databaseUpload = await UploadDAO.getUploadByIDFromDB(uploadId);
      if (!databaseUpload) {
        return "No upload found for this ID";
      }

      const awsDeleteResponse = await AwsUtil.deleteFromS3(databaseUpload.key);

      if (typeof awsDeleteResponse === "string") {
        return awsDeleteResponse;
      }

      const deleteResponse = await UploadDAO.deleteUploadByID(uploadId);

      if (typeof deleteResponse === "string") {
        return deleteResponse;
      }

      return {};
    } catch (e) {
      return e.message;
    }
  }
}
