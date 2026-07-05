import { useLiveQuery } from 'dexie-react-hooks';
import { userProfileRepo, lifestyleRepo, healthGoalsRepo } from '../db/repositories';

export function useCurrentUser() {
  const profile = useLiveQuery(() => userProfileRepo.getCurrent(), []);
  const lifestyle = useLiveQuery(
    () => (profile ? lifestyleRepo.getByUserId(profile.id) : undefined),
    [profile?.id],
  );
  const healthGoals = useLiveQuery(
    () => (profile ? healthGoalsRepo.getByUserId(profile.id) : undefined),
    [profile?.id],
  );

  // Wait for healthGoals to resolve too (when a profile exists) — otherwise
  // RequireOnboarding sees profile-resolved-but-healthGoals-still-loading as
  // "not onboarded" and incorrectly bounces the user back to onboarding.
  const isLoading = profile === undefined || (profile !== null && healthGoals === undefined);
  const isOnboarded = Boolean(profile && healthGoals);

  return { profile, lifestyle, healthGoals, isLoading, isOnboarded };
}
