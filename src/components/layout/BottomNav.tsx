import { NavLink } from 'react-router-dom';
import { House, ChartColumn, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', Icon: House },
  { to: '/reports', label: 'Reports', Icon: ChartColumn },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-lg justify-around">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                  isActive ? 'text-brand-700 dark:text-brand-400' : 'text-subtle'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
