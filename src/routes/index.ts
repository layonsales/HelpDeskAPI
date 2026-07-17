import { Router } from "express";
import { adminRoute } from "./admin-routes";
import { sessionRoute } from "./session-routes";
import { accountCustomerRoute } from "./customer-routes";
import { servicesRoute } from "./service-routes";
import { technicalRouter } from "./tecnico-routes";
import { callRouter } from "./call-routes";

const routes = Router();

routes.use("/admin", adminRoute);
routes.use("/session", sessionRoute);
routes.use("/customer-account", accountCustomerRoute);
routes.use("/services", servicesRoute);
routes.use("/technical", technicalRouter);
routes.use("/call", callRouter);

export { routes };
