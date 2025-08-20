import { ChartOfAccount } from "@/types/accounting";
import { IChartOfAccountRepository } from "../interfaces/IChartOfAccountRepository";
import { prisma } from "@/lib/prisma";

function mapPrismaToChartOfAccount(account: any): ChartOfAccount {
  return {
    id: account.id,
    code: account.code,
    name: account.name,
    type: account.type,
    parentId: account.parentId ?? undefined,
    isActive: account.isActive,
    createdAt: account.createdAt instanceof Date ? account.createdAt.toISOString() : account.createdAt,
    updatedAt: account.updatedAt instanceof Date ? account.updatedAt.toISOString() : account.updatedAt,
    // Opsiyonel alanlar
    currency: account.currency,
    projectCode: account.projectCode,
    specialCode: account.specialCode,
    operationCode: account.operationCode,
    branchId: account.branchId,
  // journalEntryLines kaldırıldı
  };
}

export class ChartOfAccountRepository implements IChartOfAccountRepository {
  async findAll(): Promise<ChartOfAccount[]> {
    const accounts = await prisma.chartOfAccount.findMany({
      orderBy: { code: 'asc' },
    });
    return accounts.map(mapPrismaToChartOfAccount);
  }

  async findById(id: string): Promise<ChartOfAccount | null> {
    const account = await prisma.chartOfAccount.findUnique({ where: { id } });
    return account ? mapPrismaToChartOfAccount(account) : null;
  }

  async create(data: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    const created = await prisma.chartOfAccount.create({
      data: {
        code: data.code!,
        name: data.name!,
        type: data.type!,
        currency: data.currency || 'TRY',
        isActive: data.isActive ?? true,
        parentId: data.parentId ?? null,
        projectCode: data.projectCode ?? null,
        specialCode: data.specialCode ?? null,
        operationCode: data.operationCode ?? null,
        branchId: data.branchId ?? null,
      },
    });
    return mapPrismaToChartOfAccount(created);
  }

  async update(id: string, data: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    const updated = await prisma.chartOfAccount.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        currency: data.currency,
        isActive: data.isActive,
        parentId: data.parentId,
        projectCode: data.projectCode,
        specialCode: data.specialCode,
        operationCode: data.operationCode,
        branchId: data.branchId,
      },
    });
    return mapPrismaToChartOfAccount(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.chartOfAccount.delete({ where: { id } });
  }
}
