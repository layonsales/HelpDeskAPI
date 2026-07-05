import { Router } from "express";
import { adminRoute } from "./admin-routes";
import { sessionRoute } from "./session-routes";

const routes = Router();

routes.use("/admin", adminRoute);
routes.use("/session", sessionRoute);

export { routes };
