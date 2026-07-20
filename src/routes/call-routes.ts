import { Router } from "express";
import { CallController } from "../controller/calls-controller";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";
import { ensureAuthorization } from "../middleware/ensure-authorization";

const callRouter = Router();
const callController = new CallController();

callRouter.use(ensureAuthorization);

callRouter.post(
  "/",
  verifyUserAuthorization(["cliente"]),
  callController.create,
);

callRouter.post(
  "/:call_id/services",
  verifyUserAuthorization(["tecnico"]),
  callController.addService,
);

callRouter.get(
  "/",
  verifyUserAuthorization(["admin", "cliente"]),
  callController.index,
);

callRouter.get(
  "/technical/me",
  verifyUserAuthorization(["tecnico"]),
  callController.myCallsAsTechnical,
);

callRouter.get(
  "/technical/:technical_id",
  verifyUserAuthorization(["admin"]),
  callController.callsByTechnicalForAdmin,
);

callRouter.patch(
  "/:id",
  verifyUserAuthorization(["admin"]),
  callController.patchStatus,
);

callRouter.patch(
  "/start/:id",
  verifyUserAuthorization(["tecnico"]),
  callController.start,
);

callRouter.patch(
  "/close/:id",
  verifyUserAuthorization(["tecnico"]),
  callController.close,
);

callRouter.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  callController.delete,
);

export { callRouter };
