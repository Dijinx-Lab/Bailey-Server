import express from "express";
import CommonsController from "../controllers/commons_controller.mjs";

const router = express.Router();

const baseRoute = "/commons";

//api routes
router.route(baseRoute + "/terms").get(CommonsController.apiGetTermsLink);

export default router;
