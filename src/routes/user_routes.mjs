import express from "express";
import UserController from "../controllers/user_controller.mjs";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";

const router = express.Router();

const baseRoute = "/user";

//api routes
router
  .route(baseRoute + "/sign-up")
  .post(
    checkRequiredFieldsMiddleware([
      "contact_name",
      "email",
      "password",
      "confirm_password",
      "fcm_token",
    ]),
    UserController.apiCreateOrGetUserAccount
  );

router
  .route(baseRoute + "/verify")
  .post(
    checkRequiredFieldsMiddleware(["type", "code", "email"]),
    UserController.apiVerifyCredential
  );

router
  .route(baseRoute + "/verify/send")
  .post(
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
  .delete(checkTokenMiddleware, UserController.apiDeleteUser);

router
  .route(baseRoute + "/complete-data")
  .get(checkTokenMiddleware, UserController.apiGetCompleteUserDetails);

export default router;
