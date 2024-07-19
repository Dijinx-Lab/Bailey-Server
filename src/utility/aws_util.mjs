import AWS from "aws-sdk";
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

  static async uploadToS3(file, key) {
    if (!AwsUtil.s3) {
      throw new Error("S3 is not initialized. Call initialize() method first.");
    }
    const params = {
      Bucket: keyConfig.aws.bucketName,
      Key: `${key}`,
      Body: file.buffer,
      ContentType: file.mimeType,
    };
    return new Promise((resolve, reject) => {
      AwsUtil.s3.upload(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(`${keyConfig.aws.cloudfrontUrl}${data.Key}`);
        }
      });
    });
  }

  static async deleteFromS3(key) {
    if (!AwsUtil.s3) {
      throw new Error("S3 is not initialized. Call initialize() method first.");
    }

    const params = {
      Bucket: keyConfig.aws.bucketName,
      Key: key,
    };
    return new Promise((resolve, reject) => {
      AwsUtil.s3.deleteObject(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
export default AwsUtil;
