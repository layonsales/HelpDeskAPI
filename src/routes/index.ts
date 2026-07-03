import { Router } from "express";
import { adminRoute } from "./admin-routes";

const routes = Router();

routes.use("/admin", adminRoute);

export { routes };
