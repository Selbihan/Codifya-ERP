import { CurrentAccount } from "@/types/accounting";
import { ICurrentAccountRepository } from "../interfaces/ICurrentAccountRepository";
import { PrismaClient } from '@prisma/client';

import { prisma } from "@/lib/prisma";

// Prisma enumunu kendi enumuna dönüştür
function mapPrismaToCurrentAccount(acc: any): CurrentAccount {
  return {
    id: acc.id,
    name: acc.name,
    type: acc.type as any, // enum uyumsuzluğunu bastırmak için (güvenli çünkü değerler aynı)
    taxNumber: acc.taxNumber ?? undefined,
    address: acc.address ?? undefined,
    phone: acc.phone ?? undefined,
    email: acc.email ?? undefined,
    isActive: acc.isActive,
    createdAt: acc.createdAt instanceof Date ? acc.createdAt.toISOString() : acc.createdAt,
    updatedAt: acc.updatedAt instanceof Date ? acc.updatedAt.toISOString() : acc.updatedAt,
  };
}

export class CurrentAccountRepository implements ICurrentAccountRepository {

  async findAll(): Promise<CurrentAccount[]> {
    const result = await prisma.currentAccount.findMany({ orderBy: { name: "asc" } });
    return result.map(mapPrismaToCurrentAccount);
  }


  async findById(id: string): Promise<CurrentAccount | null> {
    const acc = await prisma.currentAccount.findUnique({ where: { id } });
    return acc ? mapPrismaToCurrentAccount(acc) : null;
  }


  async create(data: Partial<CurrentAccount>): Promise<CurrentAccount> {
    // Zorunlu alanlar kontrolü
    if (!data.name || !data.type) throw new Error("Ad ve tip zorunludur");
    const created = await prisma.currentAccount.create({
      data: {
        name: data.name,
        type: data.type as any,
        taxNumber: data.taxNumber ?? null,
        address: data.address ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        isActive: data.isActive ?? true,
      },
    });
    return mapPrismaToCurrentAccount(created);
  }


  async update(id: string, data: Partial<CurrentAccount>): Promise<CurrentAccount> {
    const updated = await prisma.currentAccount.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type as any,
        taxNumber: data.taxNumber ?? null,
        address: data.address ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        isActive: data.isActive,
      },
    });
    return mapPrismaToCurrentAccount(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.currentAccount.delete({ where: { id } });
  }
}
