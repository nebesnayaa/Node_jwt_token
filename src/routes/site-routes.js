import { Router } from "express";
import { sendNews } from "../middlewares/user-middleware.js";

const siteRoutes = Router();
siteRoutes.get("/", (req, res) => res.render("home"));
export default siteRoutes;

siteRoutes.get("/news", sendNews, (req, res) => res.render("home"));