import { Home, Monitor, User } from "lucide-react";
import { useNavigate } from "react-router";

interface BottomNavProps {
  active: "dashboard" | "session" | "profile";
}

export default function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
    },
    {
      id: "session",
      label: "Session",
      icon: Monitor,
      path: "/session",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
      <div className="grid grid-cols-3 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 transition-colors"
              style={{
                color: isActive ? "#1B4F72" : "#6B7280",
              }}
            >
              <Icon
                className="w-6 h-6"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
