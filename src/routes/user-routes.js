import { Router } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";

const users = [];

const userRoutes = Router();

userRoutes
  .route("/signup")
  .get((req, res) => res.render("form_register"))
  .post(async (req, res) => {
    
    const { login, email, password } = req.body;
    
    if (!validator.isEmail(email)) {
      return res.status(400).send("Некоректний email");
    }
    if (!validator.isLength(password, { min: 6 })) {
      return res.status(400).send("Пароль повинен бути мінімум 6 символів");
    }
    const userExists = users.some((user) => user.email === email);
    if (userExists) {
      return res.status(400).send("Користувач з таким email вже зареєстрований");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ login, email, password: hashedPassword });
    // res.cookie("user", req.body.login, {
    //   httpOnly: true,
    //   maxAge: 2000000,
    // });
    req.session.user = { login,  email };
    res.redirect("/");
  });

userRoutes.get("/signin", (req, res) => res.render("form_auth"));

userRoutes.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Помилка при виході");
    }
    res.redirect("/");
  });
});

export default userRoutes;
