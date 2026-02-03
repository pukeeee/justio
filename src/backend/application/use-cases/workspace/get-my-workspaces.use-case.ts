import { inject, injectable } from "tsyringe";
import type { IWorkspaceRepository } from "@/backend/application/interfaces/repositories/workspace.repository.interface";
import { Workspace } from "@/backend/domain/entities/workspace.entity";

@injectable()
export class GetMyWorkspacesUseCase {
  constructor(
    @inject("IWorkspaceRepository")
    private readonly workspaceRepository: IWorkspaceRepository,
  ) {}

  async execute(userId: string): Promise<Workspace[]> {
    return await this.workspaceRepository.findAllByUserId(userId);
  }
}
