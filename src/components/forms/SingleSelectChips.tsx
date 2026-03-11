type SingleSelectChipsProps = {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

export function SingleSelectChips({ label, options, value, onChange }: SingleSelectChipsProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-800">{label}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-2xl border px-3 py-2 text-sm capitalize transition ${
                selected
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-orange-200 bg-white text-slate-700 hover:border-orange-300"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
