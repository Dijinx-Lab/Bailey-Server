import AnswerService from "../services/answers_service.mjs";
import ChallengeService from "../services/challenges_service.mjs";
import QuestionService from "../services/questions_service.mjs";
import TokenUtil from "../utility/token_util.mjs";

export default class AnswerController {
  static async apiCreateAnswer(req, res, next) {
    try {
      const { answer, team_code, question } = req.body;

      const serviceResponse = await AnswerService.addAnswer(
        answer, team_code, question
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Answer created successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetAnswer(req, res, next) {
    try {
      const _id = req.query._id;
      const serviceResponse = await AnswerService.getAnswerByID(_id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Answer details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetAnswerByTeam(req, res, next) {
    try {
      const team_code = req.query.team_code;
      const serviceResponse = await AnswerService.getAnswerByTeam(team_code);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Answer details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
