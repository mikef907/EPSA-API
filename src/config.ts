import { config } from 'dotenv';

config();

export const IsLive = process.env.LIVE;
