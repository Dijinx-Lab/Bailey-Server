import { ObjectId } from "mongodb";
import QuestionDAO from "../data/questions_dao.mjs";
import AuthUtil from "../utility/auth_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TokenUtil from "../utility/token_util.mjs";
import TokenService from "./token_service.mjs";
import ChallengeService from "./challenges_service.mjs";

export default class QuestionService {
  static async connectDatabase(client) {
    try {
      await QuestionDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addQuestion(
    score,
    type,
    question,
    picture,
    options,
    slider_min,
    slider_max,
    jumbled_word,
    challenge,
    answer
  ) {
    try {
      if (
        type !== "mcq" &&
        type !== "picture" &&
        type !== "slider" &&
        type !== "binary" &&
        type !== "wordjumble"
      ) {
        return "Unexpected Question Type";
      }

      const challenge_id_new = new ObjectId(challenge);

      const createdOn = new Date();
      const deletedOn = null;

      [picture, options, answer, slider_min, slider_max, jumbled_word] = [
        picture,
        options,
        answer,
        slider_min,
        slider_max,
        jumbled_word,
      ].map((field) => (field === undefined ? null : field));

      const quesDocument = {
        score: score,
        type: type,
        question: question,
        picture: picture,
        options: options,
        slider_min: slider_min,
        slider_max: slider_max,
        jumbled_word: jumbled_word,
        challenge: challenge_id_new,
        answer: answer,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedQuesId = await QuestionDAO.addQuestionToDB(quesDocument);
      const ques = await QuestionDAO.getQuestionByIDFromDB(addedQuesId);

      const filteredQuestion = PatternUtil.filterParametersFromObject(ques, [
        "created_on",
        "deleted_on",
      ]);

      return { question: filteredQuestion };
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
        if (existingQues.challenge != null) {
          const chalResponse = await ChallengeService.getChallengeByID(
            existingQues.challenge
          );
          if (typeof chalResponse !== "string") {
            existingQues.challenge = chalResponse;
          }
        }

        const filteredQuestion = PatternUtil.filterParametersFromObject(
          existingQues,
          ["created_on", "deleted_on"]
        );

        return filteredQuestion;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getQuestionsByChallenge(chalId) {
    try {
      const existingQues = await QuestionDAO.getQuestionsByChallengeFromDB(chalId);
      if (!existingQues) {
        return "No question found for this challenge";
      } else {
        for (let i = 0; i < existingQues.length; i++){
          if (existingQues[i].challenge != null) {
            const chalResponse = await ChallengeService.getChallengeByID(
              existingQues[i].challenge
            );
            if (typeof chalResponse !== "string") {
              existingQues[i].challenge = chalResponse;
            }
          }
  
          const filteredQuestion = PatternUtil.filterParametersFromObject(
            existingQues[i],
            ["created_on", "deleted_on"]
          );

          existingQues[i] = filteredQuestion;
        }

        return existingQues;
      }
    } catch (e) {
      return e.message;
    }
  }
}
