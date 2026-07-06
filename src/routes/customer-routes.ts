import { Router } from "express";
import { CustomerController } from "../controller/customer-controller";
import { ensureAuthorization } from "../middleware/ensure-authorization";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";

const customerRoute = Router();
const customerController = new CustomerController();

customerRoute.use(ensureAuthorization);

customerRoute.post(
  "/",
  verifyUserAuthorization(["admin"]),
  customerController.create,
);

export { customerRoute };
