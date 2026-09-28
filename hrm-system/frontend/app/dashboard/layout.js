'use client';
// app/dashboard/layout.js

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="main-content">
        <Header pathname={pathname} />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
