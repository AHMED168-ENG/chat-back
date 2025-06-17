const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

// Directory where logs will be stored
const logDir = path.join(__dirname, '../logs');

// Check if the directory exists, if not, create it
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true }); // Create directory recursively
}

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Create the logger with Daily Rotate File Transport
const logger = createLogger({
  level: 'error',
  format: combine(
    timestamp(),
    errors({ stack: true }), // Capture error stack trace
    logFormat
  ),
  transports: [
    // Log to a daily rotating file
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'), // Store logs in the created directory
      datePattern: 'YYYY-MM-DD',  // Log by date
      maxSize: '20m',  // Limit the size of each log file
      maxFiles: '14d', // Keep logs for the last 14 days
      zippedArchive: true, // Compress logs older than a day
    }),
    new transports.Console(), // Log to console
  ],
});

module.exports = logger;
