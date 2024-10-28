import { Router } from "express";
import { users } from "../data/users.js";
import { authUser, createUser, verifyToken } from "../middlewares/user-middleware.js";
import multer from "multer";
import path from "node:path";
import jwt from "jsonwebtoken";

const storage = multer.diskStorage({
  destination: "photos/",
  filename: (req, file, cb) => {
    cb(null, req.body.login + path.extname(file.originalname));
  },
});
const configMulter = multer({ storage: storage });

const userRoutes = Router();

userRoutes
  .route("/signup")
  .get((req, res) => res.render("form_register"))
  .post(configMulter.single("file"), createUser, (req, res) => {
    const token = jwt.sign({ 
      login: req.body.login, 
      email: req.body.email 
    }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });
    res.redirect("/");
  });

userRoutes
  .route("/signin")
  .get((req, res) => res.render("form_auth"))
  .post(authUser, (req, res) => {
    const token = jwt.sign({ login: req.body.login, email: req.body.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });
    res.redirect("/");
  });

userRoutes
  .get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
  });

userRoutes.get("/list", verifyToken, (req, res) => {
  res.render("user_list", { users });
});

export default userRoutes;
