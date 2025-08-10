import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ allowedRoles, children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
        router.replace(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo]);

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return null; // veya bir loading spinner dönebilirsin
  }

  return <>{children}</>;
}
