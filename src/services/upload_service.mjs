import UploadDAO from "../data/upload_dao.mjs";
import path from "path";
import AwsUtil from "../utility/aws_util.mjs";
import UserService from "./user_service.mjs";

export default class UploadService {
  static async connectDatabase(client) {
    try {
      await UploadDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addUpload(file, folder, token) {
    try {
      const databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return "No user found";
      }
      const createdOn = new Date();
      const deletedOn = null;
      const filename = createdOn.toISOString().replace(/[:.]/g, "-");
      const ext = path.extname(file.originalname);

      const formattedKey = folder
        ? `${folder}/${filename}${ext}`
        : `${filename}${ext}`;

      const access_url = await AwsUtil.uploadToS3(file, folder, createdOn, ext);

      const document = {
        user_id: databaseUser._id,
        access_url: access_url,
        extension: ext,
        file_name: filename,
        key: formattedKey,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedUploadId = await UploadDAO.addUploadToDB(document);

      const addedUpload = await UploadDAO.getUploadByIDFromDB(addedUploadId);

      return { upload: addedUpload };
    } catch (e) {
      return e.message;
    }
  }

  static async deleteUpload(uploadId) {
    try {
      const databaseUpload = await UploadService.getUploadByIDFromDB(uploadId);
      if (!databaseUser) {
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
