import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;

export const mailtrapTransport = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io", // or smtp.mailtrap.io for old UI
    port: 587,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_TOKEN,
    },
  });

export const sender = {
  address: "hello@demomailtrap.co",
  name: "Vancore",
};
