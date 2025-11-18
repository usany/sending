import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { google } from 'googleapis'
import { createServer } from 'http'
import nodemailer from 'nodemailer'
import { Server } from 'socket.io'
import { MailOptions } from 'nodemailer/lib/sendmail-transport'

dotenv.config()
const createTransporter = async () => {
  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(
    process.env.CLIENTID,
    process.env.CLIENTSECRET,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESHTOKEN
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.log(err)
        reject("Failed to create access token");
      }
      resolve(token);
      console.log(token)
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.USER,
      accessToken: accessToken as string,
      clientId: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      refreshToken: process.env.REFRESHTOKEN
    }
  });

  return transporter;
};

const sendEmail = async (emailOptions: MailOptions) => {
  try {
    const emailTransporter = await createTransporter();
    await new Promise((resolve, reject) => {
      // verify connection configuration
      emailTransporter.verify(function (error, success) {
          if (error) {
              console.log(error);
              reject(error);
          } else {
              console.log("Server is ready to take our messages");
              resolve(success);
          }
      });
    });
    await new Promise((resolve, reject) => {
      // send mail
      const res = emailTransporter.sendMail(emailOptions, (err, info) => {
        if (err) {
            console.error(err);
            reject(err);
        } else {
            console.log(info);
            resolve(info);
        }
      });
    });
    // const res = await emailTransporter.sendMail(emailOptions);
    console.log('sending')
    return res
  } catch (error) {
    console.log(error)
  }
};

const app = express()
const httpServer = createServer(app)
const corsOptions = {
  // origin: 'http://localhost:5173',
  // origin: 'https://usany.github.io',
  // origin: 'https://usany-github-io.vercel.app',
  origin: [
    'http://localhost:5173',
    'https://usany.github.io',
    'https://usany-github-io.vercel.app'
  ],
  // origin: '*',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json());
app.post('/mail', (req, res) => {
  console.log('sent')
  const reqMethod = req.method
  const reqURL = req.url
  const language = req.body.language
  const subject = language === 'ko' ? '환영합니다 쿠우산입니다! 가입 번호입니다.' : "Welcome to KHUSAN! Here is the verification number."
  const text = language === 'ko' ? `환영합니다. 번호는 ${req.body.number}입니다.` : `Welcome. The number is ${req.body.number}.`
  if (reqMethod === 'POST' && reqURL === "/mail") {
    sendEmail({
      subject: subject,
      text: text,
      to: req.body.to,
      from: process.env.USER
    });
  }
  res.send(JSON.stringify({ res: 'sending' }))
})

const io = new Server(httpServer, {
  cors: {
    // origin: "http://localhost:5173",
    // origin: 'https://usany.github.io',
    // origin: 'https://usany-github-io.vercel.app',
    origin: [
      'http://localhost:5173',
      'https://usany.github.io',
      'https://usany-github-io.vercel.app'
    ],
    // origin: '*',
    methods: ["GET", "POST"]
  }
})
httpServer.listen(5000, () => {
  console.log('ready')
})