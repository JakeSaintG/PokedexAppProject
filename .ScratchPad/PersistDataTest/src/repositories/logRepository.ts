let logRetentionDts = ''; 
let verbosLogging  = false;

export const writeError = (message: string) => {
    writeLog(message, 'error', false, true);
}

export const writeInfo = (message: string) => {
    writeLog(message, 'info', false);
}

export const writeInfoVerbose = (message: string) => {
    writeLog(message, 'info', true);
}

export const writeInfoHeader = (message: string, logLevel: string, verbose: boolean) => {
    console.log('\r\n==================================================');
    console.log(message);
    console.log('==================================================');

    writeLog(message, 'info', false);
}

export const setLogRetentionDts = (logRetentionTime: string) => {
    // take an arg like "2 months", "2 days", "2 weeks"
    // try to parse it 
    // default to 2 months
}

const writeLog = async (message: string, logLevel: string, verbose: boolean, retain: boolean = false) => {

    logCleanUp();
}

const logCleanUp = () => {

    // 

}
