import ChallengeService from "../services/challenges_service.mjs";
import QuestionService from "../services/questions_service.mjs";
import TeamService from "../services/teams_service.mjs";
import TokenUtil from "../utility/token_util.mjs";

export default class TeamController {
  static async apiCreateTeam(req, res, next) {
    try {
      const { name } = req.body;

      const serviceResponse = await TeamService.addTeam(name);
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
      const serviceResponse = await TeamService.getTeamByID(_id);
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
      const code = req.query.code;
      const serviceResponse = await TeamService.getTeamByTeamCode(code);
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

  static async apiGetAllTeams(req, res, next) {
    try {
      const serviceResponse = await TeamService.getAllTeams();
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

  static async apiUpdateTeam(req, res, next) {
    try {
      const team_code = req.query.team_code;
      const { score, active_challenge, completed_challenges } = req.body;

      const serviceResponse = await TeamService.updateTeamDetails(
        team_code,
        score,
        active_challenge,
        completed_challenges
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team updated successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiToggleActiveChallenge(req, res, next) {
    try {
      const team_code = req.query.code;
      const challenge_id = req.query.id || null;

      const serviceResponse = await TeamService.toggleActiveChallenge(
        team_code,
        challenge_id
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team updated successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiUpdateCompletedChallenges(req, res, next) {
    try {
      const team_code = req.query.code;

      const serviceResponse = await TeamService.updateCompletedChallenges(
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
          message: "Team updated successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
