import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import keyConfig from "../config/key_config.mjs";

class AwsUtil {
  static s3;

  static initialize() {
    AwsUtil.s3 = new S3Client({
      credentials: {
        accessKeyId: keyConfig.aws.accessKey,
        secretAccessKey: keyConfig.aws.secreteAccessKey,
      },
      region: keyConfig.aws.region,
    });
  }

  static async uploadToS3(file, key) {
    if (!AwsUtil.s3) {
      throw new Error("S3 is not initialized. Call initialize() method first.");
    }
    const params = {
      Bucket: keyConfig.aws.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimeType,
    };

    try {
      const command = new PutObjectCommand(params);
      await AwsUtil.s3.send(command);
      return `${keyConfig.aws.cloudfrontUrl}${key}`;
    } catch (err) {
      throw err;
    }
  }

  static async deleteFromS3(key) {
    if (!AwsUtil.s3) {
      throw new Error("S3 is not initialized. Call initialize() method first.");
    }

    const params = {
      Bucket: keyConfig.aws.bucketName,
      Key: key,
    };

    try {
      const command = new DeleteObjectCommand(params);
      return await AwsUtil.s3.send(command);
    } catch (err) {
      throw err;
    }
  }
}

export default AwsUtil;
