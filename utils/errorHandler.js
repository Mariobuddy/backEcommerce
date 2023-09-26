class customError extends Error {
  constructor(message, statusCode,status) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
    console.log(message);
  }
}

module.exports = customError;
