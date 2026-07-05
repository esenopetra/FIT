import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';

export function RequireOnboarding() {
  const { isLoading, isOnboarded } = useCurrentUser();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>;
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  return <Outlet />;
}
