import { MemberStatus } from "../libs/enums/member.enum";
import { Member } from "../libs/types/member";
import DeletedsModel from "../schema/Deleteds.model";

class DeleteService {
  private readonly deleteModel;
  constructor() {
    this.deleteModel = DeletedsModel;
  }
  public async deletedMember(member: Member): Promise<Member> {
    member.memberStatus = MemberStatus.DELETE;
    return await this.deleteModel.create(member);
  }
}

export default DeleteService;
