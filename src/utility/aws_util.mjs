import AWS from "aws-sdk";
import { Readable } from "stream";
import keyConfig from "../config/key_config.mjs";

class AwsUtil {
  static s3;

  static initialize() {
    AWS.config.update({
      accessKeyId: keyConfig.aws.accessKey,
      secretAccessKey: keyConfig.aws.secreteAccessKey,
      region: keyConfig.aws.region,
    });
    AwsUtil.s3 = new AWS.S3();
  }

  static async uploadToS3(file, folder, filename) {
    if (!AwsUtil.s3) {
      throw new Error("S3 is not initialized. Call initialize() method first.");
    }

    const key = folder ? `${folder}/${filename}` : filename;

    const params = {
      Bucket: keyConfig.aws.bucketName,
      Key: `${key}.png`,
      Body: file.buffer,
      ContentType: file.mimeType,
    };

    try {
      const data = await AwsUtil.s3.upload(params).promise();
      if (data) {
        return `${keyConfig.aws.cloudfrontUrl}${data.key}`;
      } else {
        return null;
      }
    } catch (err) {
      throw err;
    }
  }
}

export default AwsUtil;
