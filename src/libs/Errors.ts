export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum Message {
  SOMETHING_WENT_WRONG = "Something went wrong!",
  NO_DATA_FOUND = "No data is found!",
  CREATE_FAILED = "Create is failed!",
  DELETE_FAILED = "Delete is failed, wrong membernick!",
  UPDATE_FAILED = "Update is failed!",

  NO_NEW_PASSWORD = "Please insert new password!",
  NO_DATA_MATCH = "Data didn't match! Please insert the correct data",
  USED_NICK_PHONE = "You are inserting already used nick or phone!",
  NOT_VALID_PHONE = "Please Insert Valid Phone Number!",
  NOT_VALID_EMAIL = "Please Insert Valid Email Address!",
  TOKEN_CREATION_FAILED = "Token creation error!",
  BLOCKED_USER = "You have been blocked, contact the restaurant",
  NO_MEMBER_NICK = "No member with that nick!",
  NOT_AVAILABLE = "This member nick is not available!",
  NO_ADMIN_NICK = "No Admin with that nick!",
  WRONG_PASSWROD = "Wrong password please try again!",
  NOT_AUTHENTICATED = "You  are not authenticated, Please login first!",
}

class Errors extends Error {
  public code: HttpCode;
  public message: Message;

  static standard = {
    code: HttpCode.INTERNAL_SERVER_ERROR,
    message: Message.SOMETHING_WENT_WRONG,
  };

  constructor(statusCode: HttpCode, statusMessage: Message) {
    super();
    this.code = statusCode;
    this.message = statusMessage;
  }
}

export default Errors;
