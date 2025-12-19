import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { google } from 'googleapis'
import { createServer } from 'http'
import nodemailer from 'nodemailer'
// import { Server } from 'socket.io'
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

  const { token: accessToken } = await oauth2Client.getAccessToken();

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
    const res = await emailTransporter.sendMail(emailOptions);
    console.log('sending')
    return res
  } catch (error) {
    console.log(error)
  }
};

const app = express()
const httpServer = createServer(app)
const corsOptions = {
  // origin: '*',
  // origin: 'http://localhost:5173',
  // origin: 'https://usany.github.io',
  // origin: 'https://usany-github-io.vercel.app',
  // origin: 'https://khusan.co.kr',
  origin: [
    'http://localhost:5173',
    'https://usany.github.io',
    'https://usany-github-io.vercel.app',
    'https://khusan.co.kr'
  ],
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json());
app.post('/mail', async (req, res) => {
  try {
    const reqMethod = req.method
    const reqURL = req.url
    console.log(`${reqMethod} ${reqURL}`)
    const language = req.body.language
    const subject = language === 'ko' ? '환영합니다 쿠우산입니다! 가입 번호입니다.' : "Welcome to KHUSAN! Here is the verification number."
    const text = language === 'ko' ? `환영합니다. 번호는 ${req.body.number}입니다.` : `Welcome. The number is ${req.body.number}.`
    if (reqMethod === 'POST' && reqURL === "/mail") {
      console.log('sending')
      await sendEmail({
        subject: subject,
        text: text,
        to: req.body.to,
        from: process.env.USER
      });
    }
    res.send(JSON.stringify({ res: 'sending' }))
  } catch (error) {
    console.log(error)
    res.send(JSON.stringify({ res: 'error' }))
  }
})

httpServer.listen(5000, () => {
  console.log('ready')
})