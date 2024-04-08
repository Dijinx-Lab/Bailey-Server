import { config } from "dotenv";

config();

const keyConfig = {
  firebase: {
    keyLocation: process.env.FIREBASE_KEY,
  },
  aws: {
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secreteAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION,
    bucketName: process.env.AWS_S3_BUCKET_NAME,
    cloudfrontUrl: process.env.CLOUD_FRONT_URL,
  },
};

export default keyConfig;
