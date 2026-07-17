import { Router } from "express";
import { CallController } from "../controller/calls-controller";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";
import { ensureAuthorization } from "../middleware/ensure-authorization";

const callRouter = Router();
const callController = new CallController();

callRouter.use(ensureAuthorization);

callRouter.post(
  "/:id",
  verifyUserAuthorization(["cliente"]),
  callController.create,
);

callRouter.post(
  "/:call_id/services",
  verifyUserAuthorization(["tecnico"]),
  callController.addService,
);

callRouter.get("/", verifyUserAuthorization(["admin"]), callController.index);

callRouter.get(
  "/callByTechnical/:id",
  verifyUserAuthorization(["admin", "tecnico"]),
  callController.callByTechnical,
);

callRouter.patch(
  "/:id",
  verifyUserAuthorization(["admin", "tecnico"]),
  callController.patchStatus,
);

callRouter.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  callController.delete,
);

export { callRouter };
