import { config } from 'dotenv';

config();

export const IsLive: boolean = !!process.env.LIVE;
export const JwtSignature: string = process.env.JWT_SIG as string;
