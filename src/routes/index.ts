import { Router } from "express";
import { adminRoute } from "./admin-routes";
import { sessionRoute } from "./session-routes";
import { accountCustomerRoute } from "./customer-routes";
import { servicesRoute } from "./service-routes";

const routes = Router();

routes.use("/admin", adminRoute);
routes.use("/session", sessionRoute);
routes.use("/customer-account", accountCustomerRoute);
routes.use("/services", servicesRoute);

export { routes };
