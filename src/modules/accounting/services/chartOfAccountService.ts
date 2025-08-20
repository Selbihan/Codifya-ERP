import { ChartOfAccount } from "@/types/accounting";
import { IChartOfAccountRepository } from "../../../repositories/interfaces/IChartOfAccountRepository";

export class ChartOfAccountService {
  private repo: IChartOfAccountRepository;

  constructor(repo: IChartOfAccountRepository) {
    this.repo = repo;
  }

  async list(): Promise<ChartOfAccount[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<ChartOfAccount | null> {
    return this.repo.findById(id);
  }

  async create(data: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    return this.repo.create(data);
  }

  async update(id: string, data: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
