import dotenv from 'dotenv';

dotenv.config();

const DATA_SOURCE: string = (process.env.PORT) || 'sqlite';

export const Env = {
    DATA_SOURCE
} as const;
