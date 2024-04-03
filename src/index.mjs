import app from "./server.mjs";
import { MongoClient } from "mongodb";
import appConfig from "./config/app_config.mjs";
import databaseConfig from "./config/database_config.mjs";
import QuestionService from "./services/questions_service.mjs";
import ChallengeService from "./services/challenges_service.mjs";
import RouteService from "./services/routes_service.mjs";
import TeamService from "./services/teams_service.mjs";
import AnswerService from "./services/answers_service.mjs";
import FirebaseUtility from "./utility/fcm_utility.mjs";
import TimingService from "./services/timing_service.mjs";

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
    await QuestionService.connectDatabase(client);
    await ChallengeService.connectDatabase(client);
    await RouteService.connectDatabase(client);
    await TeamService.connectDatabase(client);
    await AnswerService.connectDatabase(client);
    await TimingService.connectDatabase(client);
    FirebaseUtility.initializeApp();
    app.listen(port, () => {
      console.log(`http server listening on ${port}`);
    });
  });
