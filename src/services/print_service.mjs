import TokenUtil from "../utility/token_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import AuthUtil from "../utility/auth_util.mjs";
// import EmailUtility from "../utility/email_util.mjs";
import PhotoDAO from "../data/photo_dao.mjs";
import UserService from "./user_service.mjs";
import PrintsDAO from "../data/prints_dao.mjs";
import UploadService from "./upload_service.mjs";
import { ObjectId } from "mongodb";

const hands = Object.freeze({
  LEFT: "left",
  RIGHT: "right",
});

const fingers = Object.freeze({
  PINKY: "pinky",
  RING: "ring",
  MIDDLE: "middle",
  INDEX: "index",
  THUMB: "thumb",
});

export default class PrintService {
  static async connectDatabase(client) {
    try {
      await PrintsDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addPrint(token, finger, hand, upload_id, session_id) {
    try {
      if (!Object.values(fingers).includes(finger)) {
        return `Finger is not of valid type, please choose from: ${Object.values(
          fingers
        ).join(", ")}`;
      }
      if (!Object.values(hands).includes(hand)) {
        return `Hand is not of valid type, please choose from: ${Object.values(
          hands
        ).join(", ")}`;
      }
      let databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return "User with this token does not exists";
      }

      const isSkipped = upload_id === "skip";
      const uploadObjId = isSkipped ? null : new ObjectId(upload_id);
      const sessionObjId = new ObjectId(session_id);

      const existingPrint = await PrintsDAO.getPrintBySessionHandFinger(
        sessionObjId,
        hand,
        finger
      );
      if (existingPrint) {
        return "Print already allotted for this finger";
      }

      const createdOn = new Date();
      const deletedOn = null;
      const printDocument = {
        user_id: databaseUser._id,
        session_id: sessionObjId,
        upload_id: uploadObjId,
        is_skipped: isSkipped,
        hand: hand,
        finger: finger,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedPrint = await PrintsDAO.addPrintsToDB(printDocument);

      const printData = await PrintsDAO.getPrintByIDFromDB(addedPrint);

      let filteredPrint = this.getFormattedPrint(printData);
      filteredPrint = await PatternUtil.replaceIdWithUpload(filteredPrint);
      return { fingerprint: filteredPrint };
    } catch (e) {
      return e.message;
    }
  }

  static getFormattedPrint(rawPrint) {
    const filteredPrint = PatternUtil.filterParametersFromObject(rawPrint, [
      "user_id",
      "created_on",
      "deleted_on",
    ]);
    return filteredPrint;
  }

  static async updatePrint(printId, upload_id, session_id) {
    try {
      const printObjId = new ObjectId(printId);
      const isSkipped = upload_id === "skip";
      const uploadObjId = isSkipped ? null : new ObjectId(upload_id);
      let databasePrint = await PrintsDAO.getPrintByIDFromDB(printObjId);

      if (!databasePrint) {
        return "No fingerprint found for this id";
      }

      const oldUploadId = databasePrint.upload_id;

      databasePrint = await PrintsDAO.updatePrintsFieldByID(printObjId, {
        upload_id: uploadObjId,
        is_skipped: isSkipped,
      });

      if (oldUploadId) {
        await UploadService.deleteUpload(oldUploadId);
      }

      const updatedPrint = await PrintsDAO.getPrintByIDFromDB(printObjId);

      let filteredPrint = this.getFormattedPrint(updatedPrint);
      filteredPrint = await PatternUtil.replaceIdWithUpload(filteredPrint);

      return { fingerprint: filteredPrint };
    } catch (e) {
      return e.message;
    }
  }

  static async deletePrint(token, printId) {
    try {
      const printObjId = new ObjectId(printId);
      const [databaseUser, databasePrint] = await Promise.all([
        UserService.getUserFromToken(token),
        PrintsDAO.getPrintByIDFromDB(printObjId),
      ]);

      if (!databaseUser) {
        return "User with this token does not exist";
      }
      if (!databasePrint) {
        return "Photo with this id does not exist";
      }
      if (databasePrint.user_id.toString() !== databaseUser._id.toString()) {
        return "You do not have any fingerprint with this id";
      }
      const oldUploadId = databasePrint.upload_id;

      let retrievedPhotos = await PrintsDAO.deletePrintByID(printObjId);

      if (oldUploadId) {
        await UploadService.deleteUpload(oldUploadId);
      }

      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async deleteAllUserPrints(userId) {
    try {
      const databasePhotos = await PrintsDAO.getAllPrints(userId);

      if (!databasePhotos || databasePhotos.length === 0) {
        return {};
      }

      let retrievedPhotos = await PrintsDAO.deletePrintsByUserID(userId);

      const deleteUploadPromises = databasePhotos.map(async (photo) => {
        const oldUploadId = photo.upload_id;
        if (oldUploadId) {
          await UploadService.deleteUpload(oldUploadId);
        }
      });

      await Promise.all(deleteUploadPromises);

      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async deleteAllSessionPrints(sessionId) {
    try {
      let objId = sessionId;
      if (typeof objId === "string") {
        objId = new ObjectId(sessionId);
      }

      const databasePhotos = await PrintsDAO.getAllPrints(objId);

      if (!databasePhotos || databasePhotos.length === 0) {
        return {};
      }

      let retrievedPhotos = await PrintsDAO.deletePrintsBySessionID(objId);

      const deleteUploadPromises = databasePhotos.map(async (photo) => {
        const oldUploadId = photo.upload_id;
        if (oldUploadId) {
          await UploadService.deleteUpload(oldUploadId);
        }
      });

      await Promise.all(deleteUploadPromises);

      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async checkPrintsAddedBySessionId(userId) {
    try {
      let retrievedPrint = await PrintsDAO.getAnyFirstPrint(userId);

      if (!retrievedPrint) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getAllPrints(id) {
    try {
      // let databaseUser = await UserService.getUserFromToken(token);
      // if (!databaseUser) {
      //   return "User with this token does not exist";
      // }
      let retrievedPrint = await PrintsDAO.getAllPrints(new ObjectId(id));

      if (!retrievedPrint || retrievedPrint.length === 0) {
        return {
          left_hand: [],
          right_hand: [],
        };
      } else {
        let leftHandPrints = [];
        let rightHandPrints = [];

        await Promise.all(
          retrievedPrint.map(async (print) => {
            let filteredPrint = this.getFormattedPrint(print);

            filteredPrint = await PatternUtil.replaceIdWithUpload(
              filteredPrint
            );

            filteredPrint.change_key = filteredPrint.is_skipped
              ? "skip"
              : filteredPrint.upload.access_url;

            if (print.hand === "left") {
              leftHandPrints.push(filteredPrint);
            } else if (print.hand === "right") {
              rightHandPrints.push(filteredPrint);
            }
          })
        );

        leftHandPrints = this.addMissingFingers(leftHandPrints, hands.LEFT);
        rightHandPrints = this.addMissingFingers(rightHandPrints, hands.RIGHT);

        return {
          left_hand: leftHandPrints,
          right_hand: rightHandPrints,
        };
      }
    } catch (e) {
      return e.message;
    }
  }

  static addMissingFingers(handPrints, hand) {
    const existingFingers = new Set(
      handPrints.map((handPrint) => handPrint.finger)
    );

    Object.values(fingers).forEach((finger) => {
      if (!existingFingers.has(finger)) {
        handPrints.push({ finger: finger, hand: hand, change_key: null });
      }
    });

    return handPrints;
  }
}
