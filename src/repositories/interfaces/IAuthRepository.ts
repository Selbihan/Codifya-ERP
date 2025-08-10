import { PrismaClient } from "@/generated/prisma";
import { RegisterRequest, UserRole } from "@/types/auth";

// Prisma'dan dönen User tipini kullan
type PrismaUser = NonNullable<Awaited<ReturnType<PrismaClient['user']['findUnique']>>>

export interface IAuthRepository {
    findByEmail(email: string): Promise<PrismaUser | null>;
    findByUsername(username: string): Promise<PrismaUser | null>;
    findById(id: number): Promise<PrismaUser | null>;
    createUser(data: RegisterRequest & { password: string }): Promise<PrismaUser>;
    updateUser(id: number, data: Partial<PrismaUser>): Promise<PrismaUser>;
    updatePassword(id: number, password: string): Promise<PrismaUser>;
    deactivateUser(id: number): Promise<PrismaUser>;
    activateUser(id: number): Promise<PrismaUser>;
}