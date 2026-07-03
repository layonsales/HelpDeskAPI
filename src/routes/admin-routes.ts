import { Router } from "express";
import { AdminController } from "../controller/admin-controller";

const adminRoute = Router();
const adminController = new AdminController();

adminRoute.post("/", adminController.create);
adminRoute.get("/", adminController.index);
adminRoute.patch("/:id", adminController.patch);
adminRoute.delete("/:id", adminController.delete);

export { adminRoute };
