// Rest of your imports

import type {
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';
import { app } from '@azure/functions';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const createTransporter = async () => {
	try {
		console.log('Creating OAuth2 client...');
		const OAuth2 = google.auth.OAuth2;

		// Log environment variables (remove in production)
		console.log('Environment variables:', {
			CLIENT_ID: process.env.CLIENT_ID ? '***' : 'Not set',
			CLIENT_SECRET: process.env.CLIENT_SECRET ? '***' : 'Not set',
			REFRESH_TOKEN: process.env.REFRESH_TOKEN ? '***' : 'Not set',
			USER: process.env.USER || 'Not set',
		});

		if (
			!process.env.CLIENT_ID ||
			!process.env.CLIENT_SECRET ||
			!process.env.REFRESH_TOKEN ||
			!process.env.USER
		) {
			throw new Error(
				'Missing required environment variables. Check CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, and USER.',
			);
		}

		const oauth2Client = new OAuth2(
			process.env.CLIENT_ID,
			process.env.CLIENT_SECRET,
			'https://developers.google.com/oauthplayground',
		);

		oauth2Client.setCredentials({
			refresh_token: process.env.REFRESH_TOKEN,
		});

		console.log('Getting access token...');
		const { token: accessToken } = await oauth2Client.getAccessToken();

		if (!accessToken) {
			throw new Error('Failed to get access token');
		}

		console.log('Creating transport...');
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				type: 'OAuth2',
				user: process.env.USER,
				clientId: process.env.CLIENT_ID,
				clientSecret: process.env.CLIENT_SECRET,
				refreshToken: process.env.REFRESH_TOKEN,
				accessToken: accessToken as string,
			},
		});

		// Verify the transporter
		await transporter.verify();
		console.log('Transporter verified and ready');
		return transporter;
	} catch (error) {
		console.error('Error in createTransporter:', error);
		throw error; // Re-throw to be caught by the calling function
	}
};
const sendEmail = async (emailOptions: nodemailer.SendMailOptions) => {
	try {
		console.log('Creating email transporter...');
		const emailTransporter = await createTransporter();

		console.log('Sending email with options:', {
			...emailOptions,
			text: emailOptions.text ? '***' : 'No text',
			html: emailOptions.html ? '***' : 'No HTML',
			to: emailOptions.to,
			from: emailOptions.from,
			subject: emailOptions.subject,
		});

		const res = await emailTransporter.sendMail(emailOptions);
		console.log('Email sent successfully:', res.messageId);
		return res;
	} catch (error) {
		console.error('Error in sendEmail:', error);
		throw error; // Re-throw to be caught by the HTTP handler
	}
};

app.http('sending', {
	methods: ['POST', 'OPTIONS'],
	authLevel: 'anonymous',
	handler: async (
		request: HttpRequest,
		_context: InvocationContext,
	): Promise<HttpResponseInit> => {
		// Handle CORS preflight request
		if (request.method === 'OPTIONS') {
			const headers = new Headers();
			headers.set('Access-Control-Allow-Origin', '*');
			headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
			headers.set('Access-Control-Allow-Headers', 'Content-Type');
			return {
				status: 200,
				headers: Object.fromEntries(headers.entries()),
				body: '',
			};
		}

		try {
			const reqMethod = request.method;
			const reqURL = request.url;
			console.log(`${reqMethod} ${reqURL}`);

			const body = (await request.json()) as {
				language: string;
				number: string;
				to: string;
			};
			const language = body.language;
			const subject =
				language === 'ko'
					? '환영합니다 쿠우산입니다! 가입 번호입니다.'
					: 'Welcome to KHUSAN! Here is the verification number.';
			const text =
				language === 'ko'
					? `환영합니다. 번호는 ${body.number}입니다. 문의사항은 메일로 보내주세요.`
					: `Welcome. The number is ${body.number}. Kindly send any inquiries to this email.`;

			if (reqMethod === 'POST' && reqURL.includes('/mail')) {
				console.log('sending');
				await sendEmail({
					subject: subject,
					text: text,
					to: body.to,
					from: process.env.USER,
				});
			}

			const headers = new Headers();
			headers.set('Access-Control-Allow-Origin', '*');
			headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
			headers.set('Access-Control-Allow-Headers', 'Content-Type');
			headers.set('Content-Type', 'application/json');

			return {
				status: 200,
				headers: Object.fromEntries(headers.entries()),
				jsonBody: { res: 'sending' },
			};
		} catch (error) {
			console.log(error);
			const errorHeaders = new Headers();
			errorHeaders.set('Access-Control-Allow-Origin', '*');
			errorHeaders.set('Content-Type', 'application/json');
			return {
				status: 500,
				headers: Object.fromEntries(errorHeaders.entries()),
				jsonBody: { res: 'error' },
			};
		}
	},
});
