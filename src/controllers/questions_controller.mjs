import QuestionService from "../services/questions_service.mjs";
import TokenUtil from "../utility/token_util.mjs";

export default class QuestionController {
  static async apiCreateQuestion(req, res, next) {
    try {
      const { score, type, question, picture, options, answer } = req.body;

      const serviceResponse = await QuestionService.addQuestion(
        score, type, question, picture, options, answer
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
}
