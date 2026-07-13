import { Router } from "express";
import { AccountCustomerController } from "../controller/customers-accounts-controller";
import { ensureAuthorization } from "../middleware/ensure-authorization";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";

const accountCustomerRoute = Router();
const accountCustomerController = new AccountCustomerController();

accountCustomerRoute.use(ensureAuthorization);

accountCustomerRoute.post("/", accountCustomerController.create);
accountCustomerRoute.get(
  "/",
  verifyUserAuthorization(["admin"]),
  accountCustomerController.index,
);
accountCustomerRoute.patch(
  "/:id",
  verifyUserAuthorization(["admin", "cliente"]),
  accountCustomerController.patch,
);
accountCustomerRoute.delete(
  "/:id",
  verifyUserAuthorization(["admin", "cliente"]),
  accountCustomerController.delete,
);

export { accountCustomerRoute };
