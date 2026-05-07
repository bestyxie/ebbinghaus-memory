'use client';

interface RatingButtonsProps {
  onRate: (quality: number) => void;
  disabled: boolean;
}

export function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
  const buttons = [
    {
      quality: 1,
      label: 'Forgot',
      description: 'Complete blackout',
      color: 'bg-red-500 hover:bg-red-600',
      shortcut: '1',
    },
    {
      quality: 2,
      label: 'Hard',
      description: 'Difficult, but recalled',
      color: 'bg-orange-500 hover:bg-orange-600',
      shortcut: '2',
    },
    {
      quality: 3,
      label: 'Good',
      description: 'Recalled with effort',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      shortcut: '3',
    },
    {
      quality: 4,
      label: 'Easy',
      description: 'Effortless recall',
      color: 'bg-green-500 hover:bg-green-600',
      shortcut: '4',
    },
  ];

  return (
    <div className="mt-8">
      <div className="flex justify-center items-center gap-4 flex-wrap">
        {buttons.map((button) => (
          <button
            key={button.quality}
            onClick={() => onRate(button.quality)}
            disabled={disabled}
            className={`${button.color} ${disabled ? 'opacity-50 cursor-not-allowed' : 'transform transition hover:scale-105 active:scale-95'} text-white font-semibold py-4 px-6 rounded-xl shadow-lg min-w-[140px] flex flex-col items-center gap-1`}
          >
            <span className="text-2xl font-bold">{button.label}</span>
            <span className="text-xs opacity-90">{button.description}</span>
            <span className="text-xs opacity-70 mt-1">[{button.shortcut}]</span>
          </button>
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        Press <kbd className="px-2 py-1 bg-gray-200 rounded">1</kbd>
        <kbd className="px-2 py-1 bg-gray-200 rounded mx-1">2</kbd>
        <kbd className="px-2 py-1 bg-gray-200 rounded mx-1">3</kbd>
        <kbd className="px-2 py-1 bg-gray-200 rounded">4</kbd> to rate
      </div>
    </div>
  );
}
