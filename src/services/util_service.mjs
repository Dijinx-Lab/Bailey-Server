import AwsUtil from "../utility/aws_util.mjs";
import fs from "fs";
import { resolve } from "path";

const privacyPath = resolve(
  "/home/ec2-user/Scavenger-Hunt-Server/res/privacy_policy.html"
);

const termsPath = resolve(
  "/home/ec2-user/Scavenger-Hunt-Server/res/terms_and_conditions.html"
);

export default class UtilService {
  static async uploadToS3(file, folder) {
    try {
      const uploadedOn = new Date();
      const uploadUrl = await AwsUtil.uploadToS3(
        file,
        folder,
        `${uploadedOn.toISOString()}`
      );

      return {
        url: uploadUrl,
      };
    } catch (e) {
      return e.message;
    }
  }

  static async apiUpdateFile(data, file_type) {
    try {
      if (!data) {
        return "Content is required";
      }
      const filePath = file_type === "privacy" ? privacyPath : termsPath;

      await fs.writeFile(filePath, newContent, "utf8");
      return {};
    } catch (e) {
      return `Error while editing: ${e}`;
    }
  }

  static async apiGetFileContent(file_type) {
    try {
      const filePath = file_type === "privacy" ? privacyPath : termsPath;

      const content = await fs.readFile(filePath, "utf8");
      return content;
    } catch (e) {
      return `Error while reading file: ${e}`;
    }
  }
}
