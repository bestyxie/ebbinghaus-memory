"use client";

interface DifficultySelectorProps {
  value: "5" | "4" | "3";
  onChange: (value: "5" | "4" | "3") => void;
}

const DIFFICULTY_OPTIONS = [
  { value: "5" as const, label: "Easy" },
  { value: "4" as const, label: "Medium" },
  { value: "3" as const, label: "Hard" },
];

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Initial Difficulty</label>
      <div className="flex gap-2">
        {DIFFICULTY_OPTIONS.map(option => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 py-3 border rounded-lg ${
              value === option.value
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-slate-300 hover:border-slate-400"
            }`}
          >
            <input
              type="radio"
              name="quality"
              value={option.value}
              checked={value === option.value}
              readOnly
              className="hidden"
            />
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Difficulty level determines your first review interval.
      </p>
    </div>
  );
}
