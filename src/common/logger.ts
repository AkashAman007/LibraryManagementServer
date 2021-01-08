import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const formatMessage = (message: string) => {
    message = uuidv4()  + " : " + message;
    return message;
};

const logFormat = format.combine(
    format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf((info) =>
        `${info.timestamp} ${info.level}: ${formatMessage(JSON.stringify(info.message, null, 2))}\n`),

);

const logTransport = new (DailyRotateFile)({
    datePattern: "YYYY-MM-DD",
    filename: "logs/library-%DATE%.log",
    level: "debug",
    maxFiles: "5d",
    maxSize: "500m",
    zippedArchive: false,
});

const errorTransport = new (DailyRotateFile)({
    datePattern: "YYYY-MM-DD",
    filename: "logs/error-%DATE%.log",
    level: "error",
    maxFiles: "5d",
    maxSize: "500m",
    zippedArchive: false,
});

logTransport.on("rotate", (oldFileName, newFileName) => {
    fs.rename(oldFileName, oldFileName + "-rotated", (err: any) => {
        if (err) {
            throw err;
        }
    });
});

errorTransport.on("rotate", (oldFileName, newFileName) => {
    fs.rename(oldFileName, oldFileName + "-rotated", (err: any) => {
        if (err) {
            throw err;
        }
    });
});

export const logger = createLogger({
    defaultMeta: { time: (new Date()).toString().slice(4, 24) },
    format: logFormat,
    level: "info",
    transports: [logTransport, errorTransport],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
    logger.add(new transports.Console({
        format: logFormat,
    }));
}

logger.log({
    level: "info",
    message: "Created logger",
});
