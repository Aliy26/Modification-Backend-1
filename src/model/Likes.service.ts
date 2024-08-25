import Errors, { HttpCode, Message } from "../libs/Errors";
import { Like, LikeInput } from "../libs/types/likes";
import LikeModel from "../schema/Likes.model";

class LikeService {
  private readonly likeModel;

  constructor() {
    this.likeModel = LikeModel;
  }

  public async checkLike(input: LikeInput): Promise<Like> {
    return await this.likeModel
      .findOne({
        memberId: input.memberId,
        likeRefId: input.likeRefId,
      })
      .exec();
  }
  public async deleteLike(input: LikeInput): Promise<void> {
    console.log("deleteLike");
    await this.likeModel
      .findOneAndDelete({
        memberId: input.memberId,
        likeRefId: input.likeRefId,
      })
      .exec();
  }

  public async regMemberLike(input: LikeInput): Promise<Like> {
    try {
      return await this.likeModel.create(input);
    } catch (err) {
      console.log("Error, regMemberLike", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
}

export default LikeService;
