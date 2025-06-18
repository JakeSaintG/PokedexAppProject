import dotenv from 'dotenv';

dotenv.config();

const DATA_SOURCE: string = (process.env.PORT) || 'sqlite';

const FORCE_UPDATE: boolean = ((process.env.FORCE_UPDATE) || 'false').toLowerCase() == 'true';

const VERBOSE_LOGGING: boolean = ((process.env.FORCE_UPDATE) || 'false').toLowerCase() == 'true';

const BATCH_SIZE: number = parseInt(process.env.BATCH_SIZE);

const LOG_RETAIN_DAYS: number = parseInt(process.env.LOG_RETAIN_DAYS);

export const Env = {
    DATA_SOURCE,
    FORCE_UPDATE,
    VERBOSE_LOGGING,
    BATCH_SIZE,
    LOG_RETAIN_DAYS
} as const;
