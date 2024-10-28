import { users } from "../data/users.js";
import bcrypt from "bcrypt";
import path from "node:path";
import validator from "validator";
import jwt from "jsonwebtoken";

export const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        res.locals.user = decoded.login;
      }
    });
  }
  next();
};

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(403).send("Access Denied.");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send("Invalid Token.");
    req.user = decoded;
    next();
  });
};

export const createUser = (req, res, next) => {
  if(!req.body.login || !req.body.email || !req.body.password || !req.body.confirm_password ){
    return res.status(400).send("Всі поля повинні бути заповнені.");      
  }
  if(!validator.isEmail(req.body.email)) {
    return res.status(400).send("Некоректний email");
  }
  if (!validator.isLength(req.body.password, { min: 6 })) {
    return res.status(400).send("Пароль повинен бути мінімум 6 символів");
  }
  if(req.body.password !== req.body.confirm_password ){
    return res.status(400).send("Пароль та повторний пароль не співпадають");      
  }
  if (!req.file){
    return res.status(400).send("Виберіть фото профілю.");      
  }
 
  const userExists = users.some((user) => user.email === req.body.email);
  if (userExists) {
    return res.status(400).send("Користувач з таким email вже зареєстрований");
  }
  else{
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    users.push({
      id: users.length + 1,
      login: req.body.login,
      email: req.body.email,
      password: hash,
      image: req.body.login + path.extname(req.file.originalname),
    });
  }
  next();
};

export const authUser = (req, res, next) => {
  const { login, password } = req.body;
  const user = users.find((el) => el.login == login);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.body.email = user.email;
    next();
  } else {
    res.status(400).redirect("/");
  }
};