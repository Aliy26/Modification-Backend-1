import Errors, { HttpCode, Message } from "../libs/Errors";
import { Like, LikeInput } from "../libs/types/likes";
import LikeModel from "../schema/Likes";

class LikesService {
  private readonly likeModel;

  constructor() {
    this.likeModel = LikeModel;
  }

  public async checkIfLikes(input: LikeInput): Promise<Like> {
    return await this.likeModel
      .findOne({ memberId: input.memberId, productId: input.likeRefId })
      .exec();
  }

  public async regMemberLike(input: LikeInput): Promise<void> {
    try {
      await this.likeModel.create(input);
    } catch (err) {
      console.log("Error, regMemberLike", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
}

export default LikesService;
