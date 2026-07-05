import { useNavigate } from 'react-router-dom';
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
    <div className="flex min-h-full flex-col items-center justify-center bg-brand-50 px-6 text-center">
      <div className="mb-6 text-5xl" aria-hidden="true">
        🥗
      </div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Food Intake Tracker</h1>
      <p className="mb-8 max-w-sm text-slate-600">
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
