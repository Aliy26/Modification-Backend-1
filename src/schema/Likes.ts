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
    },

    likeRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Like", likesSchema);
