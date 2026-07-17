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

export { callRouter };
