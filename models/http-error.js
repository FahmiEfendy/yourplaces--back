class HttpError extends Error {
  constructor(errorMessage, errorCode) {
    super(errorMessage); // Add a mesage property
    this.code = errorCode; // Add a code property
  }
}

module.exports = HttpError;
