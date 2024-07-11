import express from "express";
import UserController from "../controllers/user_controller.mjs";
import PhotosController from "../controllers/photos_controller.mjs";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
// import { Omics } from "aws-sdk";

const router = express.Router();

const baseRoute = "/photos";

//api routes
router
  .route(baseRoute + "/store")
  .post(
    checkRequiredFieldsMiddleware([
      "upload_id",
    ]),
    checkTokenMiddleware,
    PhotosController.apiAddPhoto
  );

router
  .route(baseRoute + "/verify")
  .post(
    checkRequiredFieldsMiddleware(["type", "code", "email"]),
    UserController.apiVerifyCredential
  );

router.route(baseRoute + "/verify/send").post(
  checkRequiredFieldsMiddleware(["type", "email"]),

  UserController.apiSendVerification
);

router
  .route(baseRoute + "/sign-in")
  .post(
    checkRequiredFieldsMiddleware(["password"]),
    UserController.apiSignInUser
  );

router.route(baseRoute + "/sso").post(UserController.apiSsoUser);

router
  .route(baseRoute + "/detail")
  .get(checkTokenMiddleware, UserController.apiGetUserDetail);

router
  .route(baseRoute + "/sign-out")
  .delete(checkTokenMiddleware, UserController.apiSignOutUser);

router
  .route(baseRoute + "/edit-profile")
  .put(checkTokenMiddleware, UserController.apiUpdateUserProfile);

router
  .route(baseRoute + "/change-password")
  .post(
    checkRequiredFieldsMiddleware([
      "old_password",
      "password",
      "confirm_password",
    ]),
    checkTokenMiddleware,
    UserController.apiUpdateUserPassword
  );

router
  .route(baseRoute + "/forgot-password")
  .post(
    checkRequiredFieldsMiddleware(["email", "password", "confirm_password"]),
    UserController.apiForgotPassword
  );

router
.route(baseRoute + "/delete")
.delete(
  checkTokenMiddleware,
  UserController.apiDeleteUser
);


export default router;
