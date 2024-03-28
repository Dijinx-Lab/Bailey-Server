import ChallengeService from "../services/challenges_service.mjs";
import QuestionService from "../services/questions_service.mjs";
import TeamService from "../services/teams_service.mjs";
import TokenUtil from "../utility/token_util.mjs";

export default class TeamController {
  static async apiCreateTeam(req, res, next) {
    try {
      const { score, active_challenge, completed_challenges } = req.body;

      const serviceResponse = await TeamService.addTeam(
        score, active_challenge, completed_challenges
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team created successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetTeam(req, res, next) {
    try {
      const _id = req.query._id;
      const serviceResponse = await TeamService.getTeamByID(
        _id
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetTeamByTeamCode(req, res, next) {
    try {
      const team_code = req.query.team_code;
      const serviceResponse = await TeamService.getTeamByTeamCode(
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
          message: "Team details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
