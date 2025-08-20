import AccountingLayout from '@/components/layout/AccountingLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccountingLayout>{children}</AccountingLayout>;
}
