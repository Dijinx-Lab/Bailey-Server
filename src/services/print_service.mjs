import TokenUtil from "../utility/token_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import AuthUtil from "../utility/auth_util.mjs";
// import EmailUtility from "../utility/email_util.mjs";
import PhotoDAO from "../data/photo_dao.mjs";
import UserService from "./user_service.mjs";
import PrintsDAO from "../data/prints_dao.mjs";
export default class PrintService {
  static async connectDatabase(client) {
    try {
      await PrintsDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addPrintInDB(
    token,
    finger,
    hand,
    upload_id
  ) {
    try {
      if (typeof upload_id !== 'string') {
        throw new Error('upload_id should be a string');
      }

      const createdOn = new Date();
      const deletedOn = null;
      let databaseUser = await UserService.getUserFromToken(token);
      if (!databaseUser) {
        return "User with this token does not exists";
      }
      const printDocument = {
        user_id: databaseUser._id,
        finger: finger,
        hand: hand,
        upload_id: upload_id,

        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedPrint = await PrintsDAO.addPrintsToDB(printDocument);

      const printData = await PrintsDAO.getPrintsByIDFromDB(addedPrint);

      const filteredPrint = this.getFormattedPrint(printData);

      return { print: filteredPrint };
    } catch (e) {
      return e.message;
    }
  }
  static getFormattedPrint(rawPrint) {
    const filteredPrint = PatternUtil.filterParametersFromObject(rawPrint, [
      "_id",
      "created_on",
      "deleted_on",
    ]);
    return filteredPrint;
  }
  static async updatePrint(token, _id, hand, finger, upload_id) {
    try {
      // let databaseUser = await this.getUserFromToken(token);
      let retrievedPrint = await PrintsDAO.getPrintsByIDFromDB(_id);
      const processedUpdateFields = UserService.convertToDotNotation({
        hand: hand,
        finger: finger,
        upload_id: upload_id,
      });
      retrievedPrint = await PrintsDAO.updatePrintsFieldByID(
        retrievedPrint._id,
        processedUpdateFields
      );

      const updatedPrint = await PrintsDAO.getPrintsByIDFromDB(retrievedPrint._id);
      const filteredPrint = this.getFormattedPrint(updatedPrint);

      return { print: filteredPrint };
    } catch (e) {
      return e.message;
    }
  }

  // static async getPrintById(token, _id,) {
  //   try {
  //     // let databaseUser = await this.getUserFromToken(token);
  //     let retrievedPrint = await PrintsDAO.getPrintsByIDFromDB(_id);


  //     // const updatedPhoto = await PhotoDAO.getPhotoByIDFromDB(retrievedPhoto._id);
  //     const filteredPrint = this.getFormattedPrint(retrievedPrint);

  //     return { print: filteredPrint };
  //   } catch (e) {
  //     return e.message;
  //   }
  // }
  static async getAllPrints() {
    try {
      // let databaseUser = await this.getUserFromToken(token);
      let retrievedPrint = await PrintsDAO.getAllPrints();


      if (!retrievedPrint) {
        return "No fingerprints found";
      } else {
        let leftHandPrints = [];
        let rightHandPrints = [];
        for (let i = 0; i < retrievedPrint.length; i++) {
          const filteredPrint = PatternUtil.filterParametersFromObject(
            retrievedPrint[i],
            ["created_on", "deleted_on"]
          );
          if (retrievedPrint[i].hand === "left") {
            leftHandPrints.push(filteredPrint);
          } else if (retrievedPrint[i].hand === "right") {
            rightHandPrints.push(filteredPrint);
          }
          // retrievedPrint[i] = filteredPrint;
        }

        return {
          leftHandPrints: leftHandPrints,
          rightHandPrints: rightHandPrints
        };
      }
    } catch (e) {
      return e.message;
    }
  }
  static async getPrintByHand(token, hand,) {
    try {
      // let databaseUser = await this.getUserFromToken(token);
      let retrievedPrint = await PrintsDAO.getPrintsByHandFromDB(hand);


      // const updatedPhoto = await PhotoDAO.getPhotoByIDFromDB(retrievedPhoto._id);
      //   const filteredPrint = this.getFormattedPrint(retrievedPrint);
      if (!retrievedPrint) {
        return "No fingerprints found";
      } else {
        for (let i = 0; i < retrievedPrint.length; i++) {
          const filteredPrint = PatternUtil.filterParametersFromObject(
            retrievedPrint[i],
            ["created_on", "deleted_on"]
          );

          retrievedPrint[i] = filteredPrint;
        }

        return { print: retrievedPrint };
      }
    } catch (e) {
      return e.message;
    }
  }


}