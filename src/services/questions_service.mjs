import QuestionDAO from "../data/questions_dao.mjs";
import AuthUtil from "../utility/auth_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TokenUtil from "../utility/token_util.mjs";
import TokenService from "./token_service.mjs";

export default class QuestionService {
  static async connectDatabase(client) {
    try {
      await QuestionDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addQuestion(score, type, question, picture, options, answer) {
    try {
      const createdOn = new Date();
      const deletedOn = null;

      if (type == "picture"){
        picture = null;
        options = null;
        answer = null;
      }

      const quesDocument = {
        score: score,
        type: type,
        question: question,
        picture: picture,
        options: options,
        answer: answer,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedQuesId = await QuestionDAO.addQuestionToDB(quesDocument);
      const ques = await QuestionDAO.getQuestionByIDFromDB(addedQuesId);

      return { question: ques };
    } catch (e) {
      return e.message;
    }
  }

  static async getQuestionByID(quesId) {
    try {
      const existingQues = await QuestionDAO.getQuestionByIDFromDB(quesId);
      if (!existingQues) {
        return "No question found for this ID";
      } else {
        return existingQues;
      }
    } catch (e) {
      return e.message;
    }
  }
}
