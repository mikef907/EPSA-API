import { config } from 'dotenv';

config();

export const IsLive = parseInt(process.env.LIVE as string) === 1;
export const JwtSignature: string = process.env.JWT_SIG as string;
export const GmailAppPW: string = process.env.GMAIL_APP_PW as string;
export const AppRoot = IsLive
  ? 'https://epsa-web.vercel.app/'
  : 'http://localhost:3000/';
