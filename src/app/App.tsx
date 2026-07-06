import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireOnboarding } from './RequireOnboarding';

const WelcomeScreen = lazy(() => import('../features/onboarding/WelcomeScreen').then((m) => ({ default: m.WelcomeScreen })));
const ProfileSetupScreen = lazy(() =>
  import('../features/onboarding/ProfileSetupScreen').then((m) => ({ default: m.ProfileSetupScreen })),
);
const LifestyleQuestionnaireScreen = lazy(() =>
  import('../features/onboarding/LifestyleQuestionnaireScreen').then((m) => ({
    default: m.LifestyleQuestionnaireScreen,
  })),
);
const HealthReportScreen = lazy(() =>
  import('../features/onboarding/HealthReportScreen').then((m) => ({ default: m.HealthReportScreen })),
);
const LoginScreen = lazy(() => import('../features/auth/LoginScreen').then((m) => ({ default: m.LoginScreen })));

const DashboardScreen = lazy(() =>
  import('../features/dashboard/DashboardScreen').then((m) => ({ default: m.DashboardScreen })),
);
const AddFoodScreen = lazy(() => import('../features/food/AddFoodScreen').then((m) => ({ default: m.AddFoodScreen })));
const CustomFoodScreen = lazy(() =>
  import('../features/food/CustomFoodScreen').then((m) => ({ default: m.CustomFoodScreen })),
);
const ManageFoodsScreen = lazy(() =>
  import('../features/food/ManageFoodsScreen').then((m) => ({ default: m.ManageFoodsScreen })),
);
const WaterScreen = lazy(() => import('../features/water/WaterScreen').then((m) => ({ default: m.WaterScreen })));
const AddExerciseScreen = lazy(() =>
  import('../features/exercise/AddExerciseScreen').then((m) => ({ default: m.AddExerciseScreen })),
);
const CustomExerciseScreen = lazy(() =>
  import('../features/exercise/CustomExerciseScreen').then((m) => ({ default: m.CustomExerciseScreen })),
);
const ManageExercisesScreen = lazy(() =>
  import('../features/exercise/ManageExercisesScreen').then((m) => ({ default: m.ManageExercisesScreen })),
);
const ReportsScreen = lazy(() => import('../features/reports/ReportsScreen').then((m) => ({ default: m.ReportsScreen })));
const SettingsScreen = lazy(() =>
  import('../features/settings/SettingsScreen').then((m) => ({ default: m.SettingsScreen })),
);
const EditProfileScreen = lazy(() =>
  import('../features/settings/EditProfileScreen').then((m) => ({ default: m.EditProfileScreen })),
);

function RouteFallback() {
  return <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>;
}

export function App() {
  return (
    <HashRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/onboarding/welcome" element={<WelcomeScreen />} />
          <Route path="/onboarding/profile" element={<ProfileSetupScreen />} />
          <Route path="/onboarding/lifestyle" element={<LifestyleQuestionnaireScreen />} />
          <Route path="/onboarding/report" element={<HealthReportScreen />} />
          <Route path="/login" element={<LoginScreen />} />

          <Route element={<RequireOnboarding />}>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/food/add" element={<AddFoodScreen />} />
            <Route path="/food/custom" element={<CustomFoodScreen />} />
            <Route path="/food/custom/:id" element={<CustomFoodScreen />} />
            <Route path="/food/manage" element={<ManageFoodsScreen />} />
            <Route path="/water" element={<WaterScreen />} />
            <Route path="/exercise/add" element={<AddExerciseScreen />} />
            <Route path="/exercise/custom" element={<CustomExerciseScreen />} />
            <Route path="/exercise/custom/:id" element={<CustomExerciseScreen />} />
            <Route path="/exercise/manage" element={<ManageExercisesScreen />} />
            <Route path="/reports" element={<ReportsScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/settings/profile" element={<EditProfileScreen />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
