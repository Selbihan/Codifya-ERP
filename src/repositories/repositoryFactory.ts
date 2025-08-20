import { PrismaClient } from '@prisma/client'
import { UserRepository } from './implementations/userRepository'
import { CustomerRepository } from './implementations/customerRepository'
import { IUserRepository, ICustomerRepository } from './interfaces'

export class RepositoryFactory {
  private static instance: RepositoryFactory
  private prisma: PrismaClient
  private repositories: Map<string, any> = new Map()

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  static getInstance(prisma: PrismaClient): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(prisma)
    }
    return RepositoryFactory.instance
  }

  getUserRepository(): IUserRepository {
    if (!this.repositories.has('user')) {
      this.repositories.set('user', new UserRepository(this.prisma))
    }
    return this.repositories.get('user')
  }

  getCustomerRepository(): ICustomerRepository {
    if (!this.repositories.has('customer')) {
      this.repositories.set('customer', new CustomerRepository(this.prisma))
    }
    return this.repositories.get('customer')
  }

  // Singleton pattern için
  static resetInstance(): void {
    RepositoryFactory.instance = null as any
  }
} 