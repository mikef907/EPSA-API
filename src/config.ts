import { config } from 'dotenv';

config();

export const IsLive: boolean = !process.env.LIVE;
