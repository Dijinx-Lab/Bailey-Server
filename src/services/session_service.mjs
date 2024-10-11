import SessionDAO from "../data/session_dao.mjs";
import UserService from "./user_service.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import PrintService from "./print_service.mjs";
import WritingService from "./writing_service.mjs";
import PhotoService from "./photo_service.mjs";
import { ObjectId } from "mongodb";

export default class SessionService {
  static async connectDatabase(client) {
    try {
      await SessionDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addSession(token, firstName, lastName, dateOfBirth) {
    try {
      let databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return "User with this token does not exists";
      }
      const createdOn = new Date();
      const deletedOn = null;
      const printDocument = {
        user_id: databaseUser._id,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedPrint = await SessionDAO.addSessionToDB(printDocument);

      const printData = await this.getFormattedPrint(
        await SessionDAO.getSessionByIDFromDB(addedPrint)
      );

      return { session: printData };
    } catch (e) {
      return e.message;
    }
  }

  static async getFormattedPrint(rawPrint) {
    const [printAdded, photoAdded, wiritingAdded] = await Promise.all([
      PrintService.checkPrintsAddedBySessionId(rawPrint._id),
      PhotoService.checkPhotosAddedBySessionId(rawPrint._id),
      WritingService.checkWritingAddedBySessionId(rawPrint._id),
    ]);
    const filteredPrint = PatternUtil.filterParametersFromObject(rawPrint, [
      "user_id",
      "created_on",
      "deleted_on",
    ]);
    filteredPrint.fingerprints_added = printAdded;
    filteredPrint.photos_added = photoAdded;
    filteredPrint.handwritings_added = wiritingAdded;
    return filteredPrint;
  }

  static async getAllSessions(token) {
    try {
      let databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return "User with this token does not exist";
      }
      let retrievedPrints = await SessionDAO.getAllSessions(databaseUser._id);
      return {
        sessions: await Promise.all(
          retrievedPrints.map((e) => this.getFormattedPrint(e))
        ),
      };
    } catch (e) {
      return e.message;
    }
  }

  static async getAllSessionsInternal(token) {
    try {
      let databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return [];
      }
      return await SessionDAO.getAllSessions(databaseUser._id);
    } catch (e) {
      return e.message;
    }
  }

  static async deleteSession(sessionId) {
    try {
      let sessionObjId = new ObjectId(sessionId);

      await Promise.all([
        SessionDAO.deleteSessionByID(sessionObjId),
        PhotoService.deleteAllSessionPhotos(sessionObjId),
        WritingService.deleteAllSessionWritings(sessionObjId),
        PrintService.deleteAllSessionPrints(sessionObjId),
      ]);

      return {};
    } catch (e) {
      return e.message;
    }
  }
}
