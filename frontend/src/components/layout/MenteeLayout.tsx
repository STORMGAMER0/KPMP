import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Monitor, User } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'session', label: 'Session', icon: Monitor, path: '/session' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export default function MenteeLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    if (location.pathname.startsWith('/session')) return 'session';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
        <div className="grid grid-cols-3 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center gap-1 transition-colors"
                style={{ color: isActive ? '#1B4F72' : '#6B7280' }}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
