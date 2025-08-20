

import ChartOfAccountList from './ChartOfAccountList';
import AccountingLayout from '@/components/layout/AccountingLayout';

const ChartOfAccountPage: React.FC = () => {
  return (
    <AccountingLayout>
  <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Hesap Planı Yönetimi</h1>
        <ChartOfAccountList />
      </div>
    </AccountingLayout>
  );
};

export default ChartOfAccountPage;
