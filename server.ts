import { createServer } from "node:http";
import cors from "cors";
import express from "express";

const app = express();
const httpServer = createServer(app);
const corsOptions = {
	// origin: '*',
	// origin: 'http://localhost:5173',
	// origin: 'https://usany.github.io',
	// origin: 'https://usany-github-io.vercel.app',
	// origin: 'https://khusan.co.kr',
	origin: [
		"http://localhost:5173",
		"https://usany.github.io",
		"https://usany-github-io.vercel.app",
		"https://khusan.co.kr",
	],
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

httpServer.listen(3000, '0.0.0.0', () => {
	console.log("ready");
});
