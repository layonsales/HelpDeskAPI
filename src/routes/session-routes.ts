import { SessionController } from "../controller/session-controller";
import { Router } from "express";

const sessionRoute = Router();
const sessionController = new SessionController();

sessionRoute.post("/", sessionController.create);

export { sessionRoute };
