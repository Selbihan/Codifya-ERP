import { ChartOfAccount } from "@/types/accounting";

export interface IChartOfAccountRepository {
  findAll(): Promise<ChartOfAccount[]>;
  findById(id: string): Promise<ChartOfAccount | null>;
  create(data: Partial<ChartOfAccount>): Promise<ChartOfAccount>;
  update(id: string, data: Partial<ChartOfAccount>): Promise<ChartOfAccount>;
  delete(id: string): Promise<void>;
}
