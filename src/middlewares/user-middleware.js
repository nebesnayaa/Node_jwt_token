import bcrypt from "bcrypt";
import path from "node:path";
import validator from "validator";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import pool from "../config/db.js";

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

export const createUser = async (req, res, next) => {
  const { login, email, password, confirm_password } = req.body;

  if(!login || !email || !password || !confirm_password ){
    return res.status(400).send("Всі поля повинні бути заповнені.");      
  }
  if(!validator.isEmail(email)) {
    return res.status(400).send("Некоректний email");
  }
  if (!validator.isLength(password, { min: 6 })) {
    return res.status(400).send("Пароль повинен бути мінімум 6 символів");
  }
  if(password !== confirm_password ){
    return res.status(400).send("Пароль та повторний пароль не співпадають");      
  }
  if (!req.file){
    return res.status(400).send("Виберіть фото профілю.");      
  }
 
  // const userExists = users.some((user) => user.email === req.body.email);
  // if (userExists) {
  //   return res.status(400).send("Користувач з таким email вже зареєстрований");
  // }
  // else{
  //   const salt = bcrypt.genSaltSync(10);
  //   const hash = bcrypt.hashSync(req.body.password, salt);

  //   users.push({
  //     id: users.length + 1,
  //     login: req.body.login,
  //     email: req.body.email,
  //     password: hash,
  //     image: req.body.login + path.extname(req.file.originalname),
  //   });
  // }
  // next();

  try {
    const [existingUser] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (existingUser.length) {
        return res.status(400).send("Користувач з таким email вже зареєстрований");
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const imagePath = login + path.extname(req.file.originalname);
    
    await pool.query(
      'INSERT INTO Users (login, email, password, image) VALUES (?, ?, ?, ?)', 
      [login, email, hash, imagePath]);

    next();
} catch (error) {
    console.error(error);
    res.status(500).send("Виникла помилка на сервері");
}
};

export const authUser = async (req, res, next) => {
  const { login, password } = req.body;
  // const user = users.find((el) => el.login == login);
  // if (user && bcrypt.compareSync(password, user.password)) {
  //   req.body.email = user.email;
  //   next();
  // } else {
  //   res.status(400).redirect("/");
  // }
  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE login = ?', [login]);
    const user = rows[0];

    if (user && bcrypt.compareSync(password, user.password)) {
      req.body.email = user.email;
      next();
    } else {
      res.status(400).redirect("/");
    }
  } catch (error) {
      console.error(error);
      res.status(500).send("Виникла помилка на сервері");
  }
};

export const feedbackUser = (req, res, next) => {
  if(req.body && req.body.email && req.body.subject && req.body.message){
    const { email, subject, message } = req.body;
    const mailOpt = {
      from: "Nebesna Olexandra <s.nebesnaya5@gmail.com>",
      to: email,
      subject: subject,
      text: message,
    };

    const trans = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "s.nebesnaya5@gmail.com",
        pass: "xusa cwsk jcsm bzvd",
      },
      tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2",
      },
    });

    trans.sendMail(mailOpt, (err, info) => {
      console.log(err, info);
      if (err) {
        console.log(err);
        res.status(400).redirect("/");
      } else {
        console.log(info);
        res.status(201).redirect("/");
      }
      return;
    });
  }
};

export const sendNews = (req, res, next) => {
  for (let user of users) 
    {
      const mailOpt = {
        from: "Nebesna Olexandra <s.nebesnaya5@gmail.com>",
        to: user.email,
        subject: "Свіжі новини від нашої компанії!",
        text: "Привіт! Ось останні новини: ми запустили нову функцію, яка допоможе вам працювати ще ефективніше!",
      };
  
      const trans = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: "s.nebesnaya5@gmail.com",
          pass: "xusa cwsk jcsm bzvd",
        },
        tls: {
          rejectUnauthorized: true,
          minVersion: "TLSv1.2",
        },
      });
    
      trans.sendMail(mailOpt, (err, info) => {
        if (err) {
          console.log(err);
          res.status(400).redirect("/");
        } else {
          // console.log(info);
          console.log(`Новина надіслана користувачу: ${user.email}`);
          res.status(201).redirect("/");
        }
        return;
      });
    }
}