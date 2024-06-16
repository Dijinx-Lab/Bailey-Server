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

      let numericScore = Number(score);
      if (isNaN(numericScore)) {
        return "Invalid score value";
      }

      let sliderMin = null;
      let sliderMax = null;
      let ans = answer;

      if (type === "slider") {
        sliderMin = Number(slider_min);
        if (isNaN(sliderMin)) {
          return "Invalid slider min value";
        }

        sliderMax = Number(slider_max);
        if (isNaN(sliderMax)) {
          return "Invalid slider max value";
        }
        ans = Number(answer);
        if (isNaN(answer)) {
          return "Invalid answer value";
        }
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

      await ChallengeService.updateChallengeStats(
        "add",
        challenge,
        numericScore
      );

      const quesDocument = {
        score: numericScore,
        type: type,
        question: question,
        picture: picture,
        options: options,
        slider_min: slider_min,
        slider_max: slider_max,
        jumbled_word: jumbled_word,
        challenge: challenge_id_new,
        answer: ans,
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

  static async updateQuestion(
    id,
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
      let existingChallenge = await QuestionDAO.getQuestionByIDFromDB(id);
      if (!existingChallenge) {
        return "No question found for this id";
      }

      let numericScore = existingChallenge.score;

      if (score) {
        numericScore = Number(score);
        if (isNaN(numericScore)) {
          return "Invalid score value";
        }
      }

      if (type) {
        existingChallenge.type = type;
      }

      if (question) {
        existingChallenge.question = question;
      }

      if (picture) {
        existingChallenge.picture = picture;
      }

      if (options) {
        existingChallenge.options = options;
      }

      if (slider_min) {
        existingChallenge.slider_min = slider_min;
      }

      if (slider_max) {
        existingChallenge.slider_max = slider_max;
      }

      if (jumbled_word) {
        existingChallenge.jumbled_word = jumbled_word;
      }

      if (challenge) {
        existingChallenge.challenge = challenge;
      }

      if (answer) {
        existingChallenge.answer = answer;
      }

      const updateResult = await QuestionDAO.updateQuestionInDB(
        existingChallenge
      );

      if (score) {
        await ChallengeService.updateChallengeStats(
          "update",
          existingChallenge.challenge,
          numericScore
        );
      }

      existingChallenge = await QuestionDAO.getQuestionByIDFromDB(id);

      // if (updateResult) {
      return { question: existingChallenge };
      // } else {
      //   return "Failed to update the challenge";
      // }
    } catch (e) {
      return e.message;
    }
  }

  static async deleteQuestion(id) {
    try {
      let existingChallenge = await QuestionDAO.getQuestionByIDFromDB(id);
      if (!existingChallenge) {
        return "No question found for this id";
      }

      const deletedOn = new Date();

      existingChallenge.deleted_on = deletedOn;

      const updateResult = await QuestionDAO.updateQuestionInDB(
        existingChallenge
      );

      await ChallengeService.updateChallengeStats(
        "delete",
        existingChallenge.challenge,
        existingChallenge.score
      );

      return {};
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
