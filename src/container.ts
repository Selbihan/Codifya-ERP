import 'reflect-metadata'
import { Container } from 'inversify'
import { PrismaClient } from '@/generated/prisma'

// Repository implementations
import { UserRepository } from './repositories/implementations/userRepository'
import { CustomerRepository } from './repositories/implementations/customerRepository'

// Service implementations
import { AuthService } from './modules/auth/services/authService'
import { CustomerService } from './modules/crm/services/customerService'

// Utility
import { Logger } from './utils/logger'

// Container oluştur
const container = new Container()

// Database connection
container.bind<PrismaClient>('PrismaClient').toConstantValue(new PrismaClient())

// Logger
container.bind<Logger>('ILogger').to(Logger).inSingletonScope()

// Repository bindings
container.bind<UserRepository>('IUserRepository').to(UserRepository).inSingletonScope()
container.bind<CustomerRepository>('ICustomerRepository').to(CustomerRepository).inSingletonScope()

// Service bindings - Factory pattern kullan
container.bind<AuthService>('IAuthService').toDynamicValue(() => {
  return new AuthService()
}).inSingletonScope()

container.bind<CustomerService>('ICustomerService').toDynamicValue(() => {
  return CustomerService.create() as CustomerService
}).inSingletonScope()

export { container } 