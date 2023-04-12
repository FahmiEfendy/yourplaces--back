class HttpError extends Error {
  constructor(errorMessage, errorCode) {
    super(errorMessage); // Add a error message property
    this.code = errorCode; // Add a error code property
  }
}

module.exports = HttpError;
