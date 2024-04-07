import { ObjectId } from "mongodb";
import databaseConfig from "../config/database_config.mjs";

let answercon;

export default class AnswerDAO {
  static async injectDB(conn) {
    if (answercon) {
      return;
    }
    try {
      answercon = conn.db(databaseConfig.database.dbName).collection("answers");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addAnswerToDB(answer) {
    try {
      const insertionResult = await answercon.insertOne(answer);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add an answer: ${e}`);
      return null;
    }
  }

  static async getAnswerByIDFromDB(id) {
    try {
      const answer = await answercon.findOne({ _id: new ObjectId(id) });
      return answer;
    } catch (e) {
      console.error(`Unable to get answer by ID: ${e}`);
      return null;
    }
  }

  static async getAnswerByQuestionFromDB(id) {
    try {
      const answer = await answercon.findOne({ question: new ObjectId(id) });
      return answer;
    } catch (e) {
      console.error(`Unable to get answer by ID: ${e}`);
      return null;
    }
  }

  static async getAnswerByTeamCode(team_code) {
    try {
      const answer = await answercon.find({ team_code: team_code }).toArray();
      return answer;
    } catch (e) {
      console.error(`Unable to get answer by Team Code: ${e}`);
      return null;
    }
  }
}