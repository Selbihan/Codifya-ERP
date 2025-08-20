"use client";

import React from "react";
import CurrentAccountList from "./CurrentAccountList";
import AccountingLayout from '@/components/layout/AccountingLayout';

const CurrentAccountPage: React.FC = () => {
  return (
    <AccountingLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cari Hesap Yönetimi</h1>
      <CurrentAccountList />
    </AccountingLayout>
  );
};

export default CurrentAccountPage;
