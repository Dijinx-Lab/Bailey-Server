import { ObjectId } from "mongodb";
import QuestionDAO from "../data/questions_dao.mjs";
import AuthUtil from "../utility/auth_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TokenUtil from "../utility/token_util.mjs";
import TokenService from "./token_service.mjs";
import ChallengeService from "./challenges_service.mjs";
import AnswerDAO from "../data/answers_dao.mjs";

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

      await ChallengeService.updateChallengeStats(challenge, score);

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

  static async getQuestionsByChallenge(chalId, team_code) {
    try {
      const [existingQues, existingAnswer] = await Promise.all([
        QuestionDAO.getQuestionsByChallengeFromDB(chalId),
        AnswerDAO.getAnswerByTeamCode(team_code),
      ]);

      if (!existingQues) {
        return "No question found for this challenge";
      } else {
        for (let i = 0; i < existingQues.length; i++) {
          const filteredQuestion = PatternUtil.filterParametersFromObject(
            existingQues[i],
            ["created_on", "deleted_on"]
          );

          filteredQuestion.submitted_answer = null;

          filteredQuestion.submitted_answer = existingAnswer.find(
            (answer) =>
              answer.question.toString() == filteredQuestion._id.toString()
          );

          existingQues[i] = filteredQuestion;
        }

        return { questions: existingQues };
      }
    } catch (e) {
      return e.message;
    }
  }
}
