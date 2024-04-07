import { config } from "dotenv";

config();

const keyConfig = {
  firebase: {
    keyLocation: process.env.FIREBASE_KEY,
  },
};

export default keyConfig;