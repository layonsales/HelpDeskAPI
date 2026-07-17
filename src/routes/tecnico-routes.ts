import { TechnicalController } from "../controller/technical-controller";
import { Router } from "express";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";
import { ensureAuthorization } from "../middleware/ensure-authorization";

const technicalRouter = Router();
const technicalController = new TechnicalController();

technicalRouter.use(ensureAuthorization);

technicalRouter.post(
  "/",
  verifyUserAuthorization(["admin"]),
  technicalController.create,
);

technicalRouter.get(
  "/",
  verifyUserAuthorization(["admin"]),
  technicalController.index,
);

technicalRouter.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  technicalController.delete,
);

technicalRouter.patch(
  "/:id",
  verifyUserAuthorization(["admin"]),
  technicalController.patch,
);

technicalRouter.patch(
  "/changeHours/:id",
  verifyUserAuthorization(["admin"]),
  technicalController.changeHours,
);

technicalRouter.patch(
  "/changePassword/:id",
  verifyUserAuthorization(["tecnico"]),
  technicalController.changePassword,
);

export { technicalRouter };
