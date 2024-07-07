import { config } from "dotenv";

config();

const appConfig = {
  server: {
    port: process.env.PORT || 3030,
    httpsPort: process.env.HTTPS_PORT || 8000,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  smtp: {
    user: process.env.EMAIL_USER,
    pwd: process.env.EMAIL_PWD,
    service: process.env.EMAIL_SERVICE,
  },
  
};

export default appConfig;
