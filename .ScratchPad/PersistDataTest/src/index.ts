import { Env } from './env';
import { runStartUp } from "./startup";

// set LOG_RETAIN_DAYS

runStartUp(Env.DATA_SOURCE, Env.FORCE_UPDATE, Env.BATCH_SIZE);
