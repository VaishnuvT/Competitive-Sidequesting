import { TagPill } from "@/components/ui/TagPill";

type ChipGroupProps = {
  label: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  maxSelections?: number;
};

export function ChipGroup({ label, options, values, onChange, maxSelections }: ChipGroupProps) {
  const toggleValue = (option: string) => {
    const selected = values.includes(option);

    if (selected) {
      onChange(values.filter((value) => value !== option));
      return;
    }

    if (maxSelections && values.length >= maxSelections) {
      return;
    }

    onChange([...values, option]);
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-800">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleValue(option)}
              className={`rounded-full border px-3 py-1.5 text-sm capitalize transition ${
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
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((value) => (
            <TagPill key={value}>{value}</TagPill>
          ))}
        </div>
      ) : null}
    </fieldset>
  );
}
