import { cleanUpOldLogs, saveLog } from "../data/configurationData";


let logRetentionDate: Date;
let verbosLogging = false;

export const logError = (message: string) => {
    const logMsg = `${new Date()} - ${message}`;
    console.error(logMsg);
    writeLog(logMsg, 'error', false, true);
};

export const logInfo = (message: string) => {
    const logMsg = `${new Date()} - ${message}`;
    console.log(logMsg);
    writeLog(message, 'info', false);
};

export const logInfoVerbose = (message: string) => {
    if (verbosLogging) {
        const logMsg = `${new Date()} - ${message}`;
        console.log(logMsg);
        writeLog(message, 'info', true);
    }
};

export const logInfoWithAttention = (message: string, logLevel: string, verbose: boolean) => {
    const logMsg = `${new Date()} - ${message}`;
    
    console.log('\r\n==================================================');
    console.log(logMsg);
    console.log('==================================================');

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

const writeLog = async (
    message: string,
    logLevel: string,
    verbose: boolean,
    retain: boolean = false
) => {
    saveLog(message, logLevel, verbose, retain);
    cleanUpOldLogs(logRetentionDate);
};
