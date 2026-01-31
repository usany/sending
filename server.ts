import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { google } from "googleapis";
import nodemailer from "nodemailer";
const createTransporter = async () => {
	const OAuth2 = google.auth.OAuth2;
	const oauth2Client = new OAuth2(
		process.env.CLIENTID,
		process.env.CLIENTSECRET,
		"https://developers.google.com/oauthplayground",
	);
	oauth2Client.setCredentials({
		refresh_token: process.env.REFRESHTOKEN,
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
			refreshToken: process.env.REFRESHTOKEN,
		},
	});

	return transporter;
};
const sendEmail = async (emailOptions: nodemailer.SendMailOptions) => {
	try {
		const emailTransporter = await createTransporter();
		const res = await emailTransporter.sendMail(emailOptions);
		console.log("sending");
		return res;
	} catch (error) {
		console.log(error);
	}
};

app.http("mail", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
		// Handle CORS preflight request
		if (request.method === "OPTIONS") {
			const headers = new Headers();
			headers.set("Access-Control-Allow-Origin", "*");
			headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
			headers.set("Access-Control-Allow-Headers", "Content-Type");
			return {
				status: 200,
				headers: Object.fromEntries(headers.entries()),
				body: ""
			};
		}

		try {
			const reqMethod = request.method;
			const reqURL = request.url;
			console.log(`${reqMethod} ${reqURL}`);
			
			const body = await request.json() as { language: string; number: string; to: string };
			const language = body.language;
			const subject =
				language === "ko"
					? "환영합니다 쿠우산입니다! 가입 번호입니다."
					: "Welcome to KHUSAN! Here is the verification number.";
			const text =
				language === "ko"
					? `환영합니다. 번호는 ${body.number}입니다. 문의사항은 메일로 보내주세요.`
					: `Welcome. The number is ${body.number}. Kindly send any inquiries to this email.`;
			
			if (reqMethod === "POST" && reqURL.includes("/mail")) {
				console.log("sending");
				await sendEmail({
					subject: subject,
					text: text,
					to: body.to,
					from: process.env.USER,
				});
			}
			
			const headers = new Headers();
			headers.set("Access-Control-Allow-Origin", "*");
			headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
			headers.set("Access-Control-Allow-Headers", "Content-Type");
			headers.set("Content-Type", "application/json");
			
			return {
				status: 200,
				headers: Object.fromEntries(headers.entries()),
				jsonBody: { res: "sending" }
			};
		} catch (error) {
			console.log(error);
			const errorHeaders = new Headers();
			errorHeaders.set("Access-Control-Allow-Origin", "*");
			errorHeaders.set("Content-Type", "application/json");
			return {
				status: 500,
				headers: Object.fromEntries(errorHeaders.entries()),
				jsonBody: { res: "error" }
			};
		}
	},
});
