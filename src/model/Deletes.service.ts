import { MemberStatus } from "../libs/enums/member.enum";
import { Member } from "../libs/types/member";
import DeletedModel from "../schema/Deleted.model";

class DeleteService {
  private readonly deleteModel;
  constructor() {
    this.deleteModel = DeletedModel;
  }
  public async deletedMember(member: Member): Promise<Member> {
    member.memberStatus = MemberStatus.DELETE;
    delete member.memberPassword;
    return await this.deleteModel.create(member);
  }
}

export default DeleteService;
