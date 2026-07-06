import { Router } from "express";
import { adminRoute } from "./admin-routes";
import { sessionRoute } from "./session-routes";
import { customerRoute } from "./customer-routes";

const routes = Router();

routes.use("/admin", adminRoute);
routes.use("/session", sessionRoute);
routes.use("/customer", customerRoute);

export { routes };
