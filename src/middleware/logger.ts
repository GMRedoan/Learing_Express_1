import type { NextFunction, Request, Response } from 'express';
import fs from 'fs';

const logger = (req : Request, res : Response, next : NextFunction) => {
    const log = `\nMethod -> ${req.method} Time -> ${new Date().toLocaleTimeString()} URL -> ${req.url} \n`;
    fs.appendFile('server.log', log, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
    next();
};

export default logger;