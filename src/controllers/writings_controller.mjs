import UserService from "../services/user_service.mjs";
import TokenUtil from "../utility/token_util.mjs";
import PrintService from "../services/print_service.mjs";
import WritingService from "../services/writing_service.mjs";
export default class WritingsController {
    static async apiAddWritings(req, res, next) {
        try {
          const { upload_id } = req.body;
          const token = TokenUtil.cleanToken(req.headers["authorization"]);
          const serviceResponse = await WritingService.addWritingInDB(
            token,
            upload_id,
          );
          if (typeof serviceResponse === "string") {
            res
              .status(200)
              .json({ success: false, data: {}, message: serviceResponse });
          } else {
            res.status(200).json({
              success: true,
              data: serviceResponse,
              message: "HandWriting has been uploaded successfully",
            });
          }
        } catch (e) {
          res.status(500).json({ success: false, data: {}, message: e.message });
        }
      }


      static async apiUpdateUploadID(req, res, next) {
        try {
          const _id = req.query._id;
          const { old_upload_id,upload_id } = req.body;
          const token = TokenUtil.cleanToken(req.headers["authorization"]);
          const serviceResponse = await WritingService.updateUploadId(
            token,
            _id,
            old_upload_id,
            upload_id
          );
          if (typeof serviceResponse === "string") {
            res
              .status(200)
              .json({ success: false, data: {}, message: serviceResponse });
          } else {
            res.status(200).json({
              success: true,
              data: serviceResponse,
              message: "Writing Updated Successfully",
            });
          }
        } catch (e) {
          res.status(500).json({ success: false, data: {}, message: e.message });
        }
      }

  // static async apiGetPrintByID(req, res, next) {
  //   try {
  //     const _id = req.query._id;
  //     // const { upload_id } = req.body;
  //     const token = TokenUtil.cleanToken(req.headers["authorization"]);
  //     const serviceResponse = await PrintService.getPrintById(
  //       token,
  //       _id,
  //       // upload_id
  //     );
  //     if (typeof serviceResponse === "string") {
  //       res
  //         .status(200)
  //         .json({ success: false, data: {}, message: serviceResponse });
  //     } else {
  //       res.status(200).json({
  //         success: true,
  //         data: serviceResponse,
  //         message: "Fingerprint Retrieved Successfully",
  //       });
  //     }
  //   } catch (e) {
  //     res.status(500).json({ success: false, data: {}, message: e.message });
  //   }
  // }
  static async apiGetAllWritings(req, res, next) {
    try {
      // const _id = req.query._id;
      // const { upload_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await WritingService.getAllUploadId(
        token,
        // _id,
        // upload_id
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "HandWritings Retrieved Successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
//   static async apiGetPrintByHand(req, res, next) {
//     try {
//       const hand = req.query.hand;
//       // const { upload_id } = req.body;
//       const token = TokenUtil.cleanToken(req.headers["authorization"]);
//       const serviceResponse = await PrintService.getPrintByHand(
//         token,
//         hand,
//         // upload_id
//       );
//       if (typeof serviceResponse === "string") {
//         res
//           .status(200)
//           .json({ success: false, data: {}, message: serviceResponse });
//       } else {
//         res.status(200).json({
//           success: true,
//           data: serviceResponse,
//           message: "Fingerprint Retrieved Successfully",
//         });
//       }
//     } catch (e) {
//       res.status(500).json({ success: false, data: {}, message: e.message });
//     }
//   }


}
