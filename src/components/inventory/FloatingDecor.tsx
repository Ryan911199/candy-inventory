import { HolidayId } from '../../lib/holidays';

interface FloatingDecorProps {
  holidayId: HolidayId;
}

/**
 * Floating animation component - adapts to holiday theme
 * Displays animated decorative elements (snowflakes, hearts, eggs, bats)
 */
export function FloatingDecor({ holidayId }: FloatingDecorProps) {
  const items = Array.from({ length: 20 }, (_, i) => ({
    left: `${(i * 5) + Math.random() * 3}%`,
    delay: i * 0.8 + Math.random() * 2,
    duration: 12 + Math.random() * 8,
    size: 10 + Math.random() * 14,
  }));

  const getSymbol = () => {
    switch (holidayId) {
      case 'christmas': return '❄';
      case 'valentines': return '♥';
      case 'easter': return '✿';
      case 'halloween': return '🦇';
      default: return '❄';
    }
  };

  const getAnimationClass = () => {
    switch (holidayId) {
      case 'christmas': return 'animate-snowfall';
      case 'valentines': return 'animate-hearts';
      case 'easter': return 'animate-eggs';
      case 'halloween': return 'animate-bats';
      default: return 'animate-snowfall';
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((item, i) => (
        <div
          key={i}
          className={`absolute text-white/40 ${getAnimationClass()} opacity-0`}
          style={{
            left: item.left,
            top: '-30px',
            fontSize: `${item.size}px`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          {getSymbol()}
        </div>
      ))}
    </div>
  );
}
