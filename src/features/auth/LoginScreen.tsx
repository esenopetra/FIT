import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Field } from '../../components/forms/Field';
import { inputClass, buttonPrimaryClass, buttonSecondaryClass, cardClass } from '../../components/forms/inputStyles';
import { useAuth } from '../../hooks/useAuth';
import { getCloudBackupMeta, restoreFromCloud } from '../../lib/cloudBackup';
import { ensureSeeded } from '../../db/seed';
import { userProfileRepo } from '../../db/repositories';

const authSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type AuthFormValues = z.infer<typeof authSchema>;

export function LoginScreen() {
  const navigate = useNavigate();
  const { isConfigured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({ resolver: zodResolver(authSchema) });

  if (!isConfigured) {
    return (
      <AppLayout title="Account">
        <section className={cardClass}>
          <p className="text-sm text-slate-600">
            Cloud account isn't set up for this app yet. Your data still works fully offline on this
            device — ask whoever set up the app to configure cloud backup if you'd like to sign in
            and sync across devices.
          </p>
        </section>
      </AppLayout>
    );
  }

  async function onSubmit(values: AuthFormValues) {
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      if (mode === 'signUp') {
        const result = await signUp(values.email, values.password);
        if (!result.session) {
          setStatusMessage('Account created. Check your email to confirm it, then sign in.');
          setMode('signIn');
          return;
        }
      } else {
        await signIn(values.email, values.password);
      }

      // Returning user, fresh device/browser: offer to restore their progress.
      try {
        const meta = await getCloudBackupMeta();
        if (meta) {
          const confirmed = window.confirm(
            `Cloud backup found from ${new Date(meta.updatedAt).toLocaleString()}. Restore it now? ` +
              'This will replace the data currently on this device.',
          );
          if (confirmed) {
            await restoreFromCloud();
            await ensureSeeded();
          }
        }
      } catch {
        // Backup check is best-effort — sign-in itself already succeeded.
      }

      const localProfile = await userProfileRepo.getCurrent();
      navigate(localProfile ? '/dashboard' : '/onboarding/welcome');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <AppLayout title="Account">
      <section className={cardClass}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {mode === 'signIn' ? 'Sign in' : 'Create account'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <input id="email" type="email" className={inputClass} {...register('email')} />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <input id="password" type="password" className={inputClass} {...register('password')} />
          </Field>

          {statusMessage && <p className="mb-4 text-sm text-brand-700">{statusMessage}</p>}
          {errorMessage && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <div className="space-y-3">
            <button type="submit" className={buttonPrimaryClass} disabled={isSubmitting}>
              {mode === 'signIn' ? 'Sign In' : 'Create Account'}
            </button>
            <button
              type="button"
              className={buttonSecondaryClass}
              onClick={() => {
                setMode(mode === 'signIn' ? 'signUp' : 'signIn');
                setErrorMessage(null);
                setStatusMessage(null);
              }}
            >
              {mode === 'signIn' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </section>
      <p className="mt-4 text-xs text-slate-400">
        Signing in is optional. Your data is always available offline on this device — an account
        just lets you back it up and restore it on another device.
      </p>
    </AppLayout>
  );
}
