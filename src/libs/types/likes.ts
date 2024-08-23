import { ObjectId } from "mongoose";
import { LikeGroup } from "../enums/likes";

export interface Like {
  _id: ObjectId;
  likeGroup: LikeGroup;
  memberId: ObjectId;
  likeRefId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface LikeInput {
  memberId: ObjectId;
  likeRefId: ObjectId;
  likeGroup: LikeGroup;
}
