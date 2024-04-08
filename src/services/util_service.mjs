import AwsUtil from "../utility/aws_util.mjs";

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
}
