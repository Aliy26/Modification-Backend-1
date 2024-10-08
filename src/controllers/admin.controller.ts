import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../model/Member.service";
import { AdminRequest, LoginInput, AdminInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import { HttpCode, Message } from "../libs/Errors";
import Errors from "../libs/Errors";

const memberService = new MemberService();

const adminController: T = {};

adminController.goHome = (req: Request, res: Response) => {
  try {
    console.log("Home Page");
    res.render("home");
  } catch (err) {
    console.log("Can't get to homepage", err);
    res.redirect("/admin");
  }
};

adminController.getSignup = (req: Request, res: Response) => {
  try {
    console.log("Signup Page");
    res.render("signup");
  } catch (err) {
    console.log("Couldn't sign up", err);
    res.redirect("/admin");
  }
};

adminController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("Login Page");
    res.render("login");
    // send | json | redirect | end | render
  } catch (err) {
    console.log("Couldn't log in", err);
    res.redirect("/admin");
  }
};

adminController.processSignup = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processSignup");
    console.log(req.body, ">>>>>>>>>>>>>>>");
    const file = req.file;
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    const newMember: AdminInput = req.body;
    newMember.memberImage = file?.path.replace(/\\/g, "/");
    newMember.memberType = MemberType.ADMIN;
    const result = await memberService.processSignup(newMember);
    // TO DO: Sessions Authentication

    req.session.member = result; // places "sid" within cookies that's on our browser & saves the result data on our database - sessions collection
    req.session.save(() => {
      res.redirect("/admin/product/all"); // only after the first two taks are done will the result be sent to our API
    });
  } catch (err) {
    console.log("Couldn't sign up", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/signup") </script>`
    );
  }
};

adminController.processLogin = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processLogin");

    const input: LoginInput = req.body;
    const result = await memberService.processLogin(input);
    // TO DO: Sessions Authentication

    req.session.member = result;
    req.session.save(() => {
      res.redirect("/admin/product/all");
    });
  } catch (err) {
    console.log("Couldn't log in", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/login") </script>`
    );
  }
};

adminController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("logout");

    req.session.destroy(() => {
      res.redirect("/admin/login");
    });
  } catch (err) {
    console.log("Couldn't log in", err);
    res.redirect("/admin");
  }
};

adminController.getUsers = async (req: Request, res: Response) => {
  try {
    console.log("getUsers");
    const result = await memberService.getUsers();
    console.log(typeof result);
    res.render("users", { users: result });
  } catch (err) {
    console.log("Error, getUsers", err);
  }
};

adminController.updateChosenUser = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenUsers");
    const result = await memberService.updateChosenUser(req.body);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenUser", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

adminController.checkAuthSession = async (req: AdminRequest, res: Response) => {
  try {
    console.log("checkAuthSession");

    if (req.session?.member)
      res.send(
        `<script> alert("Hi ${req.session.member.memberNick}!") </script>`
      );
    else res.send(`<script> alert("${Message.NOT_AUTHENTICATED}") </script>`);
  } catch (err) {
    console.log("Couldn't log in", err);
    res.send(err);
  }
};

adminController.verifyAdmin = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.session?.member?.memberType === MemberType.ADMIN) {
    req.member = req.session.member;
    next();
  } else {
    const message = Message.NOT_AUTHENTICATED;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/login'); </script>`
    );
  }
};

export default adminController;
