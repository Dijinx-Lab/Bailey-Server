import express from "express";
import UserController from "../controllers/user_controller.mjs";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";

const router = express.Router();

const userRoute = "/user";
//api routes
router
  .route(userRoute + "/create")
  .post(
    checkRequiredFieldsMiddleware([
      "firstname",
      "lastname",
      "email",
      "password",
    ]),
    UserController.apiCreateUserAccount
  );

router
  .route(userRoute + "/sign-in")
  .post(
    checkRequiredFieldsMiddleware([
      "email",
      "password",
      "device_name",
      "device_id",
      "ip_address",
    ]),
    UserController.apiSignInUserAccount
  );

router
  .route(userRoute + "/update/password")
  .post(
    checkRequiredFieldsMiddleware(["old_password", "new_password"]),
    checkTokenMiddleware,
    UserController.apiUpdateAccountPassword
  );

router
  .route(userRoute + "/update")
  .post(checkTokenMiddleware, UserController.apiUpdateAccountDetails);

router
  .route(userRoute + "/sign-out")
  .delete(checkTokenMiddleware, UserController.apiSignOutUserAccount);

router
  .route(userRoute + "/details")
  .get(checkTokenMiddleware, UserController.apiGetUserAccountDetails);

export default router;
