import { CurrentAccount } from "@/types/accounting";
import { ICurrentAccountRepository } from "../../../repositories/interfaces/ICurrentAccountRepository";

export class CurrentAccountService {
  private repo: ICurrentAccountRepository;

  constructor(repo: ICurrentAccountRepository) {
    this.repo = repo;
  }

  async list(): Promise<CurrentAccount[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<CurrentAccount | null> {
    return this.repo.findById(id);
  }

  async create(data: Partial<CurrentAccount>): Promise<CurrentAccount> {
    return this.repo.create(data);
  }

  async update(id: string, data: Partial<CurrentAccount>): Promise<CurrentAccount> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
