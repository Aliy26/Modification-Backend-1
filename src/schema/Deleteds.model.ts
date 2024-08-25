import mongoose, { Schema } from "mongoose";
import { MemberType } from "../libs/enums/member.enum";

// DeletedMember Schema
const deletedMemberSchema = new Schema(
  {
    // Mirror fields from the Member schema
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
  { timestamps: true }
);

export default mongoose.model("DeletedMember", deletedMemberSchema);
