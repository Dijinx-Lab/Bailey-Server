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

  static async addTeam(score, active_challenge, completed_challenges) {
    try {
      const createdOn = new Date();
      const deletedOn = null;

      const object_active_challenge = new ObjectId(active_challenge);
      const object_completed_challenges = completed_challenges.map(completed_challenge => new ObjectId(completed_challenge));

      let team_code;

      while (true){
        team_code = PatternUtil.generateRandomCode();
        const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);

        if (existingTeam){
          continue;
        }

        break;
      }

      const teamDocument = {
        team_code: team_code,
        score: score,
        active_challenge: object_active_challenge,
        completed_challenges: object_completed_challenges,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addTeamId = await TeamDAO.addTeamToDB(teamDocument);
      const team = await TeamDAO.getTeamByIDFromDB(addTeamId);

      const filteredTeam = PatternUtil.filterParametersFromObject(
        team,
        ["created_on", "deleted_on"]
      );

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
        if (existingTeam.completed_challenges != null) {
          for (let i = 0; i < existingTeam.completed_challenges.length; i++) {
            const chalResponse = await ChallengeService.getChallengeByID(existingTeam.completed_challenges[i]);
            existingTeam.completed_challenges[i] = chalResponse;
          }
        }
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
        if (existingTeam.completed_challenges != null) {
          for (let i = 0; i < existingTeam.completed_challenges.length; i++) {
            const chalResponse = await ChallengeService.getChallengeByID(existingTeam.completed_challenges[i]);
            existingTeam.completed_challenges[i] = chalResponse;
          }
        }
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
}