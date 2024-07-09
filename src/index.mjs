import app from "./server.mjs";
import { MongoClient } from "mongodb";
import appConfig from "./config/app_config.mjs";
import databaseConfig from "./config/database_config.mjs";
import FirebaseUtility from "./utility/fcm_utility.mjs";
import AwsUtil from "./utility/aws_util.mjs";
import UserService from "./services/user_service.mjs";
import UploadService from "./services/upload_service.mjs";
const port = appConfig.server.port;

const username = encodeURIComponent(databaseConfig.database.username);
const password = encodeURIComponent(databaseConfig.database.password);

const uri = `mongodb://${databaseConfig.database.host}:${databaseConfig.database.port}/${databaseConfig.database.dbName}`;
MongoClient.connect(uri, {
  maxPoolSize: 50,
  wtimeoutMS: 2500,
})
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async (client) => {
    await UserService.connectDatabase(client);
    await UploadService.connectDatabase(client);
    FirebaseUtility.initializeApp();
    AwsUtil.initialize();
    app.listen(port, () => {
      console.log(`dev server listening on ${port}`);
    });
  });
