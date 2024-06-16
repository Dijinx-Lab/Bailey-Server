import { ObjectId } from "mongodb";
import AuthUtil from "../utility/auth_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TokenUtil from "../utility/token_util.mjs";
import TokenService from "./token_service.mjs";
import QuestionService from "./questions_service.mjs";
import AnswerDAO from "../data/answers_dao.mjs";
import TeamService from "./teams_service.mjs";
import AwsUtil from "../utility/aws_util.mjs";
import QuestionDAO from "../data/questions_dao.mjs";

export default class AnswerService {
  static async connectDatabase(client) {
    try {
      await AnswerDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addAnswer(answer, team_code, question) {
    try {
      const questionId = new ObjectId(question);
      const quesResponse = await QuestionService.getQuestionByID(questionId);

      const createdOn = new Date();
      const deletedOn = null;

      if (!quesResponse) {
        return "No Question Found for this ID";
      }

      const score = quesResponse.score;
      let is_correct = false;

      if (
        quesResponse.type === "picture" ||
        (quesResponse.type === "slider" && quesResponse.answer === answer) ||
        quesResponse.answer.toLowerCase() === answer.toLowerCase()
      ) {
        const teamResponse = await TeamService.getTeamByTeamCode(team_code);

        if (!teamResponse) {
          return "No Team Found for this Team Code";
        }

        const new_team_score = score + teamResponse.team.score;

        await TeamService.updateTeamDetails(
          team_code,
          null,
          new_team_score,
          null,
          null
        );
        is_correct = true;
      }

      const answerDocument = {
        answer: answer,
        team_code: team_code,
        score: score,
        is_correct: is_correct,
        question: questionId,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedAnswerId = await AnswerDAO.addAnswerToDB(answerDocument);
      const answerResponse = await AnswerDAO.getAnswerByIDFromDB(addedAnswerId);

      return { answer: answerResponse };
    } catch (e) {
      return e.message;
    }
  }

  static async getAnswerByID(answerId) {
    try {
      const existingAnswer = await AnswerDAO.getAnswerByIDFromDB(answerId);
      if (!existingAnswer) {
        return "No answer found for this ID";
      } else {
        if (existingAnswer.question != null) {
          const quesResponse = await QuestionService.getQuestionByID(
            existingAnswer.question
          );
          if (typeof quesResponse !== "string") {
            existingAnswer.question = quesResponse;
          }
        }
        const filteredAnswer = PatternUtil.filterParametersFromObject(
          existingAnswer,
          ["created_on", "deleted_on"]
        );
        return filteredAnswer;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getAnswerByTeam(team_code) {
    try {
      const existingAnswer = await AnswerDAO.getAnswerByTeamCode(team_code);
      if (!existingAnswer) {
        return "No answer found for this team code";
      } else {
        for (let i = 0; i < existingAnswer.length; i++) {
          if (existingAnswer[i].question != null) {
            const quesResponse = await QuestionService.getQuestionByID(
              existingAnswer[i].question
            );
            if (typeof quesResponse !== "string") {
              existingAnswer[i].question = quesResponse;
            }
          }
          const filteredAnswer = PatternUtil.filterParametersFromObject(
            existingAnswer[i],
            ["created_on", "deleted_on"]
          );

          existingAnswer[i] = filteredAnswer;
        }

        return existingAnswer;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getAnswerByChallenges(chalId) {
    try {
      const existingQues = await QuestionDAO.getQuestionsByChallengeFromDB(
        chalId
      );

      if (!existingQues) {
        return "No questions found for this challenge ID";
      }

      const answerPromises = existingQues.map((ques) =>
        AnswerDAO.getAnswerByQuestionFromDB(ques._id)
      );
      const allAnswers = await Promise.all(answerPromises);

      const answers = allAnswers.filter(
        (answer) => answer !== null && answer !== undefined
      );

      if (answers.length === 0) {
        return "No answer found for this team code";
      } else {
        for (let i = 0; i < answers.length; i++) {
          const filteredAnswer = PatternUtil.filterParametersFromObject(
            answers[i],
            ["created_on", "deleted_on"]
          );

          answers[i] = filteredAnswer;
        }

        return answers;
      }
    } catch (e) {
      return e.message;
    }
  }
}
