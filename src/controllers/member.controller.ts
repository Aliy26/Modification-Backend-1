import { NextFunction, Request, response, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../model/Member.service";
import {
  MemberInput,
  LoginInput,
  Member,
  ExtendedRequest,
  MemberUpdateInput,
  UpdatePassword,
} from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../model/Auth.service";
import { AUTH_TIMER } from "../libs/config";
import validator from "validator";
// REACT

const memberService = new MemberService();
const authService = new AuthService();

const memberController: T = {};

memberController.getRestaurant = async (req: Request, res: Response) => {
  try {
    console.log("getRestaurant");
    const result = await memberService.getRestaurant();
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Couldn't sign up", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.signup = async (req: Request, res: Response) => {
  try {
    console.log("signup");
    const input: MemberInput = req.body;
    const { memberPhone, memberEmail } = req.body;
    if (!validator.isMobilePhone(memberPhone))
      throw new Errors(HttpCode.BAD_REQUEST, Message.NOT_VALID_PHONE);
    if (!validator.isEmail(memberEmail)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NOT_VALID_EMAIL);
    }

    const result: Member = await memberService.signup(input),
      token = await authService.createToken(result);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.CREATED).json({ member: result, accessCookie: token });
  } catch (err) {
    console.log("Couldn't sign up", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.login = async (req: Request, res: Response) => {
  try {
    console.log("login");
    const input: LoginInput = req.body,
      result = await memberService.login(input),
      token = await authService.createToken(result);
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({ member: result, accessToken: token });
  } catch (err) {
    console.log("Couldn't log in", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.logout = (req: ExtendedRequest, res: Response) => {
  console.log("logout");
  res.cookie("accessToken", null, { maxAge: 0, httpOnly: true });
  res.status(HttpCode.OK).json({ logout: true });
  try {
  } catch (err) {
    console.log("Error logout", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.getMemberDetail = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("getMemberDetail");
    const result = await memberService.getMemberDetail(req.member);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error logout", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.updatePassword = async (req: Request, res: Response) => {
  try {
    console.log("updatePassword");
    const input: UpdatePassword = req.body;
    const result = await memberService.updatePassword(input);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updatePassword", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateMember");

    const input: MemberUpdateInput = req.body;
    if (req.file) input.memberImage = req.file.path.replace(/\\/, "/");

    const result = await memberService.updateMember(req.member, input);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error updateMember", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.deleteMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("deleteMember");
    const input: LoginInput = req.body;
    const memberNick: string = req.member.memberNick;
    const result = await memberService.deleteMember(input, memberNick);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, deleteMember", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.deleteImage = async (req: ExtendedRequest, res: Response) => {
  const { memberNick } = req.member;

  const result = await memberService.deleteImage(memberNick);
  console.log(result);
  res.status(200).json(result);
};

memberController.getTopUsers = async (req: Request, res: Response) => {
  try {
    console.log("getTopUsers");
    const result = await memberService.getTopUsers();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error updateMember", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);
    if (!req.member)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    next();
  } catch (err) {
    console.log("Error verifyAuth:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.retrieveAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);
    next();
  } catch (err) {
    console.log("Error retrieveAuth:", err);
    next();
  }
};

export default memberController;
