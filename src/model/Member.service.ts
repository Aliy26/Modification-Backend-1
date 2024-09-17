import MemberModel from "../schema/Member.model";
import {
  Member,
  MemberInput,
  LoginInput,
  MemberUpdateInput,
  UpdatePassword,
} from "../libs/types/member";
import Errors from "../libs/Errors";
import { HttpCode, Message } from "../libs/Errors";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import * as bcrypt from "bcryptjs";
import { shapeIntoMongooseObjectId } from "../libs/config";
import DeleteService from "./Deletes.service";

class MemberService {
  private readonly memberModel;
  private readonly deleteService;

  constructor() {
    this.memberModel = MemberModel;
    this.deleteService = new DeleteService();
  }

  //* SPA */

  public async getRestaurant(): Promise<Member> {
    const result = await this.memberModel
      .findOne({ memberType: MemberType.RESTAURANT })
      .lean()
      .exec();
    result.target = "Test";

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async signup(input: MemberInput): Promise<Member> {
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result.toJSON();
    } catch (err) {
      console.error("Error, model:signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }
  }

  public async login(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        {
          memberNick: input.memberNick,
          memberStatus: { $ne: MemberStatus.DELETE },
        },
        { memberNick: 1, memberPassword: 1, memberStatus: 1 }
      )
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    else if (member.memberStatus === MemberStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );
    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWROD);
    }

    return await this.memberModel.findById(member._id).lean().exec();
  }

  public async getMemberDetail(member: Member): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = await this.memberModel
      .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async updatePassword(input: UpdatePassword): Promise<Member> {
    const salt = await bcrypt.genSalt();
    input.newPassword = await bcrypt.hash(input.newPassword, salt);

    const member = await this.memberModel
      .findOne({
        memberNick: input.memberNick,
        memberStatus: { $ne: MemberStatus.DELETE },
      })
      .select("+memberPassword")
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );

    if (!isMatch) throw new Errors(HttpCode.FORBIDDEN, Message.WRONG_PASSWROD);

    const result = this.memberModel
      .findOneAndUpdate(
        { memberNick: input.memberNick },
        { memberPassword: input.newPassword },
        { new: true }
      )
      .exec();

    return result;
  }

  public async updateMember(
    member: Member,
    input: MemberUpdateInput
  ): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = this.memberModel
      .findOneAndUpdate({ _id: memberId }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }

  public async deleteMember(
    input: LoginInput,
    memberNick: string
  ): Promise<Member> {
    console.log(input.memberNick, memberNick);
    if (input.memberNick !== memberNick)
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_MATCH);
    const member = await this.memberModel
      .findOne({
        memberNick: input.memberNick,
      })
      .select("+memberPassword")
      .lean()
      .exec();

    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );
    if (!isMatch) throw new Errors(HttpCode.FORBIDDEN, Message.WRONG_PASSWROD);

    await this.deleteService.deletedMember(member);

    await this.memberModel
      .findOneAndDelete({ memberNick: input.memberNick })
      .exec();

    return member;
  }

  public async deleteImage(memberNick: string): Promise<Member> {
    const member = await this.memberModel.findOneAndUpdate(
      { memberNick: memberNick },
      { memberImage: null },
      { new: true }
    );

    return member;
  }

  public async getTopUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({
        memberStatus: MemberStatus.ACTIVE,
        memberPoints: { $gte: 1 },
      })
      .sort({ memberPoints: "desc" })
      .limit(4)
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async addUserPoint(member: Member, point: number): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    return await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberType: MemberType.USER,
          memberStatus: MemberStatus.ACTIVE,
        },
        { $inc: { memberPoints: point } },
        { new: true }
      )
      .exec();
  }

  //* SSR */

  public async processSignup(input: MemberInput): Promise<Member> {
    const exsit = await this.memberModel
      .findOne({ memberType: MemberType.RESTAURANT })
      .exec();

    if (exsit) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";

      return result;
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async processLogin(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        { memberNick: input.memberNick, memberType: MemberType.RESTAURANT },
        { memberNick: 1, memberPassword: 1 }
      )
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_ADMIN_NICK);

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWROD);
    }

    return await this.memberModel.findById(member._id).exec();
  }

  public async getUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({ memberType: MemberType.USER })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async updateChosenUser(input: MemberUpdateInput): Promise<Member> {
    input._id = shapeIntoMongooseObjectId(input._id);
    const result = await this.memberModel
      .findByIdAndUpdate({ _id: input._id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}

export default MemberService;
