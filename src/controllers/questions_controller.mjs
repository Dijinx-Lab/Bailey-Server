import QuestionService from "../services/questions_service.mjs";

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

  static async apiUpdateQuestion(req, res, next) {
    try {
      const _id = req.query.id;
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

      const serviceResponse = await QuestionService.updateQuestion(
        _id,
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
          message: "Question updated successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiDeleteQuestion(req, res, next) {
    try {
      const _id = req.query.id;
      const serviceResponse = await QuestionService.deleteQuestion(_id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Question deleted successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetQuestion(req, res, next) {
    try {
      const _id = req.query.id;
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
      const challenge_id = req.query.id;
      const team_code = req.query.code;
      const serviceResponse = await QuestionService.getQuestionsByChallenge(
        challenge_id,
        team_code
      );
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
