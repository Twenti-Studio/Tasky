import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'debug.log');

export const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
};
