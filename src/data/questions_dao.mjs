import { ObjectId } from "mongodb";
import databaseConfig from "../config/database_config.mjs";

let quescon;

export default class QuestionDAO {
  static async injectDB(conn) {
    if (quescon) {
      return;
    }
    try {
      quescon = conn.db(databaseConfig.database.dbName).collection("questions");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addQuestionToDB(question) {
    try {
      const insertionResult = await quescon.insertOne(question);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add a question: ${e}`);
      return null;
    }
  }

  static async getQuestionByIDFromDB(id) {
    try {
      const ques = await quescon.findOne({ _id: new ObjectId(id) });
      return ques;
    } catch (e) {
      console.error(`Unable to get question by ID: ${e}`);
      return null;
    }
  }

  static async getQuestionsByChallengeFromDB(challenge) {
    try {
      const ques = await quescon.find({ challenge: new ObjectId(challenge) }).toArray();
      return ques;
    } catch (e) {
      console.error(`Unable to get questions by challenge: ${e}`);
      return null;
    }
  }
}