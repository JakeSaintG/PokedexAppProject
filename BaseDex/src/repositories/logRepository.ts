import { cleanUpOldLogs, saveLog } from "../postgres/data/configurationData";
import type { PGliteWithLive } from '@electric-sql/pglite/live';

let logRetentionDate: Date;
// TODO: make this settable
let verboseLogging = false;

export const logError = (dbContext: PGliteWithLive, message: string, fatal: boolean = false) => {
    const logMsg = `${new Date().toISOString()} - ${message}`;
    console.error(logMsg);
    writeLog(dbContext, logMsg, 'error', false, true);

    if (fatal) throw message;
};

export const logInfo = (dbContext: PGliteWithLive, message: string) => {
    const logMsg = `${new Date().toISOString()} - ${message}`;
    console.log(logMsg);
    writeLog(dbContext, message, 'info', false);
};

export const logInfoVerbose = (dbContext: PGliteWithLive, message: string) => {
    if (verboseLogging) {
        const logMsg = `${new Date().toISOString()} - ${message}`;
        console.log(logMsg);
        writeLog(dbContext, message, 'verbose', true);
    }
};

export const logInfoWithAttention = (dbContext: PGliteWithLive, message: string) => {
    const logMsg = `${new Date().toISOString()} - ${message}`;
    const attnTxt = '==================================================';

    console.log(`\r\n${attnTxt}\r\n${logMsg}\r\n${attnTxt}`);

    writeLog(dbContext, message, 'info', false);
};

export const setLogRetentionDays = (logRetentionDays: number) => {
    try {
        logRetentionDate = new Date(new Date().getTime() - logRetentionDays * 24 * 60 * 60 * 1000);
    } catch {
        console.log('Failed to set log retention days. Defaulting to 60 days (2 months).')
        logRetentionDate = new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000);
    }
};

export const setVerboseLogging = (isVerbose: boolean) => verboseLogging = isVerbose;

const writeLog = async (
    dbContext: PGliteWithLive, 
    message: string,
    logLevel: string,
    verbose: boolean,
    retain: boolean = false
) => {
    saveLog(dbContext, {
        message: message,
        logLevel: logLevel,
        verbose: verbose,
        retain: retain
    });

    cleanUpOldLogs(dbContext, logRetentionDate);
};
