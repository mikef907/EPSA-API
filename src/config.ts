import { config } from 'dotenv';

config();

export const IsLive = parseInt(process.env.LIVE as string) === 1;
export const JwtSignature: string = process.env.JWT_SIG as string;
