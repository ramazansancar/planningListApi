import {
    Router
} from "express";
import {
    errorMessage
} from "../functions/helpers.js";
const router = Router();

import * as planningController from "../controllers/planning/index.js";
import * as mainController from "../controllers/main/index.js";

router.get("/", mainController.main);
router.get("/healthCheck", mainController.healthCheck);

router.get("/turknet/", planningController.getTurkNet);
router.get("/turktelekom/cities/", planningController.getTurkTelekomCities);
router.get("/turktelekom/", planningController.getTurkTelekom);
router.get("/gibir/", planningController.getGibir);

router.get("*", (req, res) => {
    return errorMessage(res, "404 Not Found", req.params, "404 Not Found", 404)
});

export default router;
