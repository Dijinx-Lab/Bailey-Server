import TimingDAO from "../data/timing_dao.mjs";
import moment from "moment";
import FirebaseUtility from "../utility/fcm_utility.mjs";

export default class TimingService {
  static async connectDatabase(client) {
    try {
      await TimingDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addTiming(fcmToken, teamCode, routeId, durationInMinutes) {
    try {
      const createdOn = new Date();
      const deletedOn = null;
      const schudeledNotif = await this.scheduleTimeout(
        teamCode,
        fcmToken,
        routeId,
        createdOn,
        durationInMinutes
      );

      const userDocument = {
        route_id: routeId,
        team_code: teamCode,
        start_time: createdOn,
        end_time: null,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedUserId = await TimingDAO.addTimingToDB(userDocument);

      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async getTimingDetails(teamCode, routeId, durationInMinutes) {
    try {
      const existingTiming =
        await TimingDAO.getTimingByRouteIDAndTeamCodeFromDB(teamCode, routeId);

      if (!existingTiming) {
        return null;
      } else {
        const currentTime = moment();
        const startTime = moment(existingTiming.start_time);
        const endTime = startTime.clone().add(durationInMinutes, "minutes");
        let timeLeft = endTime.diff(currentTime, "minutes");
        if (timeLeft < 0) {
          timeLeft = 0;
        }
        let timings = {
          start_time: existingTiming.start_time,
          end_time: existingTiming.end_time,
          time_left: timeLeft,
        };
        return { timings };
      }
    } catch (e) {
      return null;
    }
  }

  static async scheduleTimeout(
    teamCode,
    fcmToken,
    routeId,
    startTime,
    durationInMinutes
  ) {
    try {
      const startTimeInMillis = new Date(startTime).getTime();
      const timeoutDurationInMillis = durationInMinutes * 60 * 1000;
      const endTimeInMillis = startTimeInMillis + timeoutDurationInMillis;

      const currentTimeInMillis = Date.now();
      const timeLeftInMillis = endTimeInMillis - currentTimeInMillis;

      if (timeLeftInMillis > 0) {
        const timeout = setTimeout(async () => {
          await this.addEndTime(teamCode, routeId);
          await FirebaseUtility.sendNotification(
            fcmToken,
            routeId,
            "open_route_summary",
            "Times up for the Hunt ⏰",
            "View the summary and your team's performance throughout the scavenger hunt"
          );
        }, timeLeftInMillis);

        return {};
      }
    } catch (e) {
      console.log(e.message);
      return null;
    }
  }

  static async addEndTime(teamCode, routeId) {
    try {
      const existingTiming =
        await TimingDAO.getTimingByRouteIDAndTeamCodeFromDB(teamCode, routeId);

      if (!existingTiming) {
        return "No team found for this team code";
      }

      if (existingTiming.end_time) {
        return;
      }
      existingTiming.end_time = new Date();

      const updateResult = await TimingDAO.updateTimingInDB(existingTiming);

      if (updateResult) {
        return {};
      } else {
        return "Failed to update the team";
      }
    } catch (e) {
      console.log(e.message);
      return e.message;
    }
  }
}
