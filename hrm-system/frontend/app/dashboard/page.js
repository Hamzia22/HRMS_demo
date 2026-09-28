'use client';
// app/dashboard/page.js — redirects to role-specific dashboard

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, loading, router]);

  return (
    <div className="loading-state">
      <div className="spinner" />
      <span>Redirecting...</span>
    </div>
  );
}
