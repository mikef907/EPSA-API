import { config } from 'dotenv';

config();

export const IsLive = false;
export const JwtSignature: string = process.env.JWT_SIG as string;
