import { CurrentAccount } from "@/types/accounting";

export interface ICurrentAccountRepository {
  findAll(): Promise<CurrentAccount[]>;
  findById(id: string): Promise<CurrentAccount | null>;
  create(data: Partial<CurrentAccount>): Promise<CurrentAccount>;
  update(id: string, data: Partial<CurrentAccount>): Promise<CurrentAccount>;
  delete(id: string): Promise<void>;
}
