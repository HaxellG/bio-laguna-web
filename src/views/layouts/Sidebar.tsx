import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/',      icon: 'dashboard',    label: 'Dashboard'         },
  { to: '/chat',  icon: 'chat_bubble',  label: 'Chat de Análisis'  },
  { to: '/about', icon: 'info',         label: 'Acerca de'         },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const location = useLocation();

  // Close drawer on route change (mobile)
  useEffect(() => {
    onClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Backdrop (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm
          transition-transform duration-300
          lg:static lg:h-auto lg:self-stretch lg:translate-x-0 lg:flex lg:flex-shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-icons-round text-primary-500 text-3xl">biotech</span>
            <div className="leading-tight">
              <p className="font-semibold text-gray-900 text-sm">Bio-Laguna</p>
              <p className="text-xs text-gray-400 font-medium">Monitoreo Ambiental</p>
            </div>
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-700"
            aria-label="Close menu"
          >
            <span className="material-icons-round text-xl">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
            >
              <span className="material-icons-round text-xl">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer / version */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">© Bio-Laguna 2026</p>
        </div>
      </aside>
    </>
  );
}
