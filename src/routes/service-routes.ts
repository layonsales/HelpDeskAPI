import { ServicesController } from "../controller/services-controller";
import { Router } from "express";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";
import { ensureAuthorization } from "../middleware/ensure-authorization";

const servicesRoute = Router();
const servicesController = new ServicesController();
servicesRoute.use(ensureAuthorization);

servicesRoute.post(
  "/",
  verifyUserAuthorization(["admin"]),
  servicesController.create,
);
servicesRoute.get(
  "/",
  verifyUserAuthorization(["admin", "cliente"]),
  servicesController.index,
);
servicesRoute.patch(
  "/:id",
  verifyUserAuthorization(["admin"]),
  servicesController.patch,
);
servicesRoute.patch(
  "/deactivate/:id",
  verifyUserAuthorization(["admin"]),
  servicesController.deactivate,
);

export { servicesRoute };
