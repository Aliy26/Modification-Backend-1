import mongoose, { Schema } from "mongoose";
import { MemberType } from "../libs/enums/member.enum";

const deletedMemberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },

    memberStatus: {
      type: String,
    },

    memberNick: {
      type: String,
    },

    memberPhone: {
      type: String,
    },

    memberPassword: {
      type: String,
      select: false,
    },

    memberAddress: {
      type: String,
    },

    memberDesc: {
      type: String,
    },

    memberImage: {
      type: String,
    },

    memberPoints: {
      type: Number,
      default: 0,
    },

    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, collection: "deletedMembers" }
);

export default mongoose.model("DeletedMember", deletedMemberSchema);
