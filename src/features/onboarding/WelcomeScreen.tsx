import { useNavigate } from 'react-router-dom';
import { Salad } from 'lucide-react';
import { buttonPrimaryClass, buttonSecondaryClass } from '../../components/forms/inputStyles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { isCloudConfigured } from '../../lib/supabaseClient';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { profile, lifestyle, isOnboarded, isLoading } = useCurrentUser();

  function handleContinue() {
    if (isOnboarded) return navigate('/dashboard');
    if (lifestyle) return navigate('/onboarding/report');
    navigate('/onboarding/lifestyle');
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-tint">
        <Salad size={30} strokeWidth={1.75} className="text-brand-600 dark:text-brand-400" aria-hidden="true" />
      </div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-ink">Food Intake Tracker</h1>
      <p className="mb-8 max-w-sm text-muted">
        Track your daily food, water, and exercise, and get simple health goals based on your own
        body details — all stored privately on your device.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          className={buttonPrimaryClass}
          onClick={() => navigate('/onboarding/profile')}
        >
          Start
        </button>
        {!isLoading && profile && (
          <button type="button" className={buttonSecondaryClass} onClick={handleContinue}>
            Continue as {profile.name}
          </button>
        )}
        {!isLoading && !profile && isCloudConfigured && (
          <button type="button" className={buttonSecondaryClass} onClick={() => navigate('/login')}>
            Sign in to restore your data
          </button>
        )}
      </div>
    </div>
  );
}
