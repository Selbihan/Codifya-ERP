// Hesap Planı (Chart of Account) Type'ları
export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType | string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  currency?: string;
  projectCode?: string;
  specialCode?: string;
  operationCode?: string;
  branchId?: string;
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

// Cari Hesap Type'ları
export interface CurrentAccount {
  id: string;
  name: string;
  type: CurrentAccountType;
  taxNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum CurrentAccountType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  OTHER = 'OTHER',
}
