import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { readFile } from "fs/promises";

import keyConfig from "../config/key_config.mjs";

class AwsUtil {
  static s3;
  static ses;

  static initialize() {
    AwsUtil.s3 = new S3Client({
      credentials: {
        accessKeyId: keyConfig.aws.accessKey,
        secretAccessKey: keyConfig.aws.secreteAccessKey,
      },
      region: keyConfig.aws.region,
    });
    AwsUtil.ses = new SESClient({
      region: keyConfig.aws.region,
      credentials: {
        accessKeyId: keyConfig.aws.accessKey,
        secretAccessKey: keyConfig.aws.secreteAccessKey,
      },
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

  static async sendEmail(destinationEmail, forPassword, code) {
    let htmlContent = await readFile(
      forPassword
        ? "././templates/password_reset_code.html"
        : "././templates/registration_code.html",
      "utf-8"
    );
    htmlContent = htmlContent.replace("OTP_CODE", code);
    const params = {
      Source: "service@baileyandbailey.com",
      Destination: {
        ToAddresses: [destinationEmail],
      },
      Message: {
        Body: {
          Html: {
            Data: htmlContent,
          },
        },
        Subject: {
          Data: forPassword
            ? "Verify your email to reset your password"
            : "Verify your email to complete your registration",
        },
      },
    };
    try {
      const command = new SendEmailCommand(params);
      await AwsUtil.ses.send(command);
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }
}

export default AwsUtil;
