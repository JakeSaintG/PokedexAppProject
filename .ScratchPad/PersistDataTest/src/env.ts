import dotenv from 'dotenv';

dotenv.config();

const DATA_SOURCE: string = (process.env.PORT) || 'sqlite';

const FORCE_UPDATE: boolean = ((process.env.FORCE_UPDATE) || 'false').toLowerCase() == 'true';

export const Env = {
    DATA_SOURCE,
    FORCE_UPDATE
} as const;
