import mongoose, { Schema } from "mongoose";
import { LikeGroup } from "../libs/enums/likes";

const likesSchema = new Schema(
  {
    likeGroup: {
      type: String,
      enum: LikeGroup,
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },

    likeRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

likesSchema.index({ memberId: 1, likeRefId: 1 }, { unique: true });

export default mongoose.model("Like", likesSchema);
