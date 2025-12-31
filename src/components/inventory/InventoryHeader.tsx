import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  MapPin, 
  Calendar, 
  Pencil,
  RefreshCw,
  Candy,
  Gift,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import { HolidayConfig } from '../../lib/holidays';
import { formatTargetDate } from '../../lib/dateUtils';

interface InventoryHeaderProps {
  storeNumber: string;
  holiday: HolidayConfig;
  targetDate: string;
  daysRemaining: number;
  onOpenDatePicker: () => void;
  onOpenLocationModal: () => void;
  onLogout: () => void;
  onSwitchHoliday: () => void;
}

type NavSection = 'candy' | 'gm' | 'overview' | 'feedback';

const NAV_SECTIONS: { id: NavSection; label: string; icon: React.ReactNode; route: string }[] = [
  { id: 'candy', label: 'Candy', icon: <Candy size={16} />, route: '/candy' },
  { id: 'gm', label: 'GM', icon: <Gift size={16} />, route: '/gm' },
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} />, route: '/overview' },
  { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={16} />, route: '/feedback' },
];

export function InventoryHeader({
  storeNumber,
  holiday,
  targetDate,
  daysRemaining,
  onOpenDatePicker,
  onOpenLocationModal,
  onLogout,
  onSwitchHoliday,
}: InventoryHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Determine active section from current route
  const getActiveSection = (): NavSection => {
    if (location.pathname === '/overview') return 'overview';
    if (location.pathname === '/gm') return 'gm';
    if (location.pathname === '/feedback') return 'feedback';
    return 'candy'; // default
  };

  const activeSection = getActiveSection();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleNavClick = (section: NavSection) => {
    navigate(NAV_SECTIONS.find(s => s.id === section)?.route || '/candy');
  };

  const handleMenuAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <header className="mb-4 text-white">
      {/* Row 1: Title and Menu */}
      <div className="flex items-center justify-between mb-3">
        {/* Left: Title */}
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-xl font-extrabold drop-shadow-md flex items-center gap-1.5">
              <span className="text-2xl">{holiday.icon}</span>
              <span>Store #{storeNumber}</span>
            </h1>
            <p className="text-white/80 text-xs font-medium opacity-90">
              {holiday.name} Inventory
            </p>
          </div>
        </div>

        {/* Right: Target Date (compact) + Menu */}
        <div className="flex items-center gap-2">
          {/* Compact Target Date */}
          <button
            onClick={onOpenDatePicker}
            className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-white/30 hover:bg-white/30 transition-all flex items-center gap-1.5 group"
            title="Change target date"
          >
            <Calendar size={14} className="text-white/80" />
            <div className="text-left">
              <div className="text-sm font-bold leading-none flex items-center gap-1">
                {formatTargetDate(targetDate)}
                <Pencil size={10} className="opacity-50 group-hover:opacity-100" />
              </div>
              <div className="text-[10px] text-white/70 font-medium">{daysRemaining}d left</div>
            </div>
          </button>

          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2.5 rounded-lg transition-all ${
                menuOpen 
                  ? 'bg-white/40 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-1">
                  <button
                    onClick={() => handleMenuAction(onOpenLocationModal)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <MapPin size={18} className="text-gray-500" />
                    <span className="font-medium">Manage Locations</span>
                  </button>
                  
                  <button
                    onClick={() => handleMenuAction(onSwitchHoliday)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <RefreshCw size={18} className="text-gray-500" />
                    <span className="font-medium">Switch Holiday</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1" />
                  
                  <button
                    onClick={() => handleMenuAction(onLogout)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Switch Store</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Section Navigation Tabs */}
      <div className="flex bg-white/15 backdrop-blur-sm rounded-xl p-1 border border-white/20">
        {NAV_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                isActive
                  ? 'bg-white text-gray-800 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {section.icon}
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
