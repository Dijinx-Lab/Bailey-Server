import QuestionService from "../services/questions_service.mjs";
import TokenUtil from "../utility/token_util.mjs";

export default class QuestionController {
  static async apiCreateQuestion(req, res, next) {
    try {
      const {
        score,
        type,
        question,
        picture,
        options,
        slider_min,
        slider_max,
        jumbled_word,
        challenge,
        answer,
      } = req.body;

      const serviceResponse = await QuestionService.addQuestion(
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
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Question created successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetQuestion(req, res, next) {
    try {
      const _id = req.query._id;
      const serviceResponse = await QuestionService.getQuestionByID(_id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Question details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetQuestionsByChallenge(req, res, next) {
    try {
      const challenge_id = req.query.challenge_id;
      const serviceResponse = await QuestionService.getQuestionsByChallenge(challenge_id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Question details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
