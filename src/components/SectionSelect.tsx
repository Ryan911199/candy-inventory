import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { HolidayId, HOLIDAYS } from '../lib/holidays';

interface SectionSelectProps {
  holidayId: HolidayId;
  storeNumber: string;
  onLogout: () => void;
  onSwitchHoliday: () => void;
}

export default function SectionSelect({ holidayId, storeNumber, onLogout, onSwitchHoliday }: SectionSelectProps) {
  const navigate = useNavigate();
  const holiday = HOLIDAYS[holidayId];
  const { theme } = holiday;

  const sections = [
    {
      id: 'candy',
      name: 'Candy',
      icon: '🍬',
      description: 'Seasonal candy and food items',
      path: '/candy',
      color: 'from-pink-500 to-red-500',
      hoverColor: 'hover:from-pink-600 hover:to-red-600',
    },
    {
      id: 'gm',
      name: 'GM',
      icon: '🎁',
      description: 'General merchandise',
      path: '/gm',
      color: 'from-blue-500 to-indigo-500',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-600',
    },
    {
      id: 'overview',
      name: 'Overview',
      icon: '📊',
      description: 'Reports and totals',
      path: '/overview',
      color: 'from-emerald-500 to-teal-500',
      hoverColor: 'hover:from-emerald-600 hover:to-teal-600',
    },
  ];

  const gradientClass = `${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo}`;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradientClass} flex flex-col`}>
      {/* Header */}
      <header className="p-4 flex items-center justify-between text-white">
        <div>
          <h1 className="text-2xl font-extrabold drop-shadow-md flex items-center">
            <span className="mr-2 text-3xl">{holiday.icon}</span> Liability Tracker
          </h1>
          <p className="text-white/80 text-xs font-medium opacity-90 pl-1">
            Store #{storeNumber} - {holiday.shortName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Switch Store"
          >
            <LogOut size={20} />
          </button>
          <button
            onClick={onSwitchHoliday}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Switch Holiday"
          >
            <span className="text-lg">{holiday.icon}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 className="text-white text-xl font-bold mb-6 text-center">
          Select a Section
        </h2>

        <div className="grid gap-4 w-full max-w-md">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => navigate(section.path)}
              className={`
                bg-gradient-to-r ${section.color} ${section.hoverColor}
                text-white rounded-2xl p-6 shadow-lg
                transform transition-all duration-200
                hover:scale-[1.02] hover:shadow-xl
                active:scale-[0.98]
                flex items-center gap-4
              `}
            >
              <span className="text-4xl">{section.icon}</span>
              <div className="text-left">
                <h3 className="text-xl font-bold">{section.name}</h3>
                <p className="text-white/80 text-sm">{section.description}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-white/60 text-xs">
        Tap a section to manage inventory
      </footer>
    </div>
  );
}
