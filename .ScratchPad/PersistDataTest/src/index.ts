import { Env } from './env';
import { setLogRetentionDays, setVerboseLogging } from './repositories/logRepository';
import { runStartUp } from "./startup";

setVerboseLogging(Env.VERBOSE_LOGGING);

setLogRetentionDays(Env.LOG_RETAIN_DAYS);

// Allow something else to happen while start up is going on.
runStartUp(Env.DATA_SOURCE, Env.FORCE_UPDATE, Env.BATCH_SIZE);
