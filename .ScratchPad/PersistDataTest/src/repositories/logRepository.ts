import { cleanUpOldLogs, saveLog } from "../data/configurationData";

let logRetentionDate: Date;
let verboseLogging = false;

export const logError = (message: string, fatal: boolean = false) => {
    const logMsg = `${new Date().toISOString()} - ${message}`;
    console.error(logMsg);
    writeLog(logMsg, 'error', false, true);

    if (fatal) throw message;
};

export const logInfo = (message: string) => {
    const logMsg = `${new Date().toISOString()} - ${message}`;
    console.log(logMsg);
    writeLog(message, 'info', false);
};

export const logInfoVerbose = (message: string) => {
    if (verboseLogging) {
        const logMsg = `${new Date().toISOString()} - ${message}`;
        console.log(logMsg);
        writeLog(message, 'verbose', true);
    }
};

export const logInfoWithAttention = (message: string) => {
    const logMsg = `${new Date().toISOString()} - ${message}`;
    const attnTxt = '==================================================';

    console.log(`\r\n${attnTxt}\r\n${logMsg}\r\n${attnTxt}`);

    writeLog(message, 'info', false);
};

export const setLogRetentionDays = (logRetentionDays: number) => {
    try {
        logRetentionDate = new Date(new Date().getTime() - logRetentionDays * 24 * 60 * 60 * 1000);
    } catch (error) {
        console.log('Failed to set log retention days. Defaulting to 60 days (2 months).')
        logRetentionDate = new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000);
    }
};

export const setVerboseLogging = (isVerbose) => {
    verboseLogging = isVerbose;
}

const writeLog = async (
    message: string,
    logLevel: string,
    verbose: boolean,
    retain: boolean = false
) => {
    saveLog({
        message: message,
        logLevel: logLevel,
        verbose: verbose,
        retain: retain
    });

    cleanUpOldLogs(logRetentionDate);
};
