import ChallengeDAO from "../data/challenges_dao.mjs";
import { ObjectId } from "mongodb";
import AuthUtil from "../utility/auth_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TokenUtil from "../utility/token_util.mjs";
import TokenService from "./token_service.mjs";
import QuestionService from "./questions_service.mjs";
import TeamDAO from "../data/team_dao.mjs";
import ChallengeService from "./challenges_service.mjs";

export default class TeamService {
  static async connectDatabase(client) {
    try {
      await TeamDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addTeam(name) {
    try {
      const createdOn = new Date();
      const deletedOn = null;

      let team_code;

      while (true) {
        team_code = PatternUtil.generateRandomCode();
        const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);

        if (existingTeam) {
          continue;
        }

        break;
      }

      const teamDocument = {
        name: name,
        team_code: team_code,
        score: 0,
        active_challenge: null,
        completed_challenges: [],
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addTeamId = await TeamDAO.addTeamToDB(teamDocument);
      const team = await TeamDAO.getTeamByIDFromDB(addTeamId);

      const filteredTeam = PatternUtil.filterParametersFromObject(team, [
        "created_on",
        "deleted_on",
      ]);

      return { team: filteredTeam };
    } catch (e) {
      return e.message;
    }
  }

  static async getTeamByID(teamId) {
    try {
      const existingTeam = await TeamDAO.getTeamByIDFromDB(teamId);
      if (!existingTeam) {
        return "No team found for this ID";
      } else {
        const filteredTeam = PatternUtil.filterParametersFromObject(
          existingTeam,
          ["created_on", "deleted_on"]
        );
        return filteredTeam;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getTeamByTeamCode(team_code) {
    try {
      const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);
      if (!existingTeam) {
        return "No team found for this Team Code";
      } else {
        const filteredTeam = PatternUtil.filterParametersFromObject(
          existingTeam,
          ["created_on", "deleted_on"]
        );
        return filteredTeam;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getAllTeams() {
    try {
      const existingTeam = await TeamDAO.getAllTeamsFromDB();
      if (!existingTeam) {
        return "No teams found";
      } else {
        for (let j = 0; j < existingTeam.length; j++) {
          const filteredTeam = PatternUtil.filterParametersFromObject(
            existingTeam[j],
            ["created_on", "deleted_on"]
          );

          existingTeam[j] = filteredTeam;
        }

        return existingTeam;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async updateTeamDetails(
    team_code,
    score,
    active_challenge,
    completed_challenges
  ) {
    try {
      const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);
      if (!existingTeam) {
        return "No team found for this team code";
      }

      if (score) {
        existingTeam.score = score;
      }

      if (active_challenge) {
        existingTeam.active_challenge = active_challenge;
      }

      if (completed_challenges) {
        existingTeam.completed_challenges = completed_challenges;
      }

      const updateResult = await TeamDAO.updateTeamInDB(existingTeam);

      if (updateResult) {
        return {};
      } else {
        return "Failed to update the team";
      }
    } catch (e) {
      return e.message;
    }
  }

  static async toggleActiveChallenge(team_code, active_challenge) {
    try {
      const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);
      if (!existingTeam) {
        return "No team found for this team code";
      }

      existingTeam.active_challenge = existingTeam.active_challenge
        ? null
        : active_challenge;

      const updateResult = await TeamDAO.updateTeamInDB(existingTeam);

      if (updateResult) {
        return {};
      } else {
        return "Failed to update the active challenge";
      }
    } catch (e) {
      return e.message;
    }
  }

  static async updateCompletedChallenges(team_code) {
    try {
      const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);
      if (!existingTeam) {
        return "No team found for this team code";
      }

      // if (challenge_id !== existingTeam.active_challenge) {
      //   return "Not an active challenge";
      // }

      // existingTeam.completed_challenges =
      //   existingTeam.completed_challenges || [];
      // existingTeam.completed_challenges.push(challenge_id);
      // existingTeam.active_challenge = null;

      if (existingTeam.active_challenge == null) {
        return "No active challenge";
      }

      existingTeam.completed_challenges =
        existingTeam.completed_challenges || [];
      existingTeam.completed_challenges.push(existingTeam.active_challenge);
      existingTeam.active_challenge = null;

      const updateResult = await TeamDAO.updateTeamInDB(existingTeam);

      if (updateResult) {
        return {};
      } else {
        return "Failed to update the team";
      }
    } catch (e) {
      return e.message;
    }
  }
}
