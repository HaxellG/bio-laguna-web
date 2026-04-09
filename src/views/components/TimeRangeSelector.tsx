import { TimePreset } from '../../controllers/dashboardController';

const PRESETS: { value: TimePreset; label: string }[] = [
  { value: '1h',     label: 'Última hora'     },
  { value: '6h',     label: 'Últimas 6 h'     },
  { value: '24h',    label: 'Últimas 24 h'    },
  { value: '7d',     label: 'Últimos 7 d'     },
  { value: 'custom', label: 'Personalizado…'  },
];

interface Props {
  preset: TimePreset;
  onChange: (p: TimePreset) => void;
  customFrom: Date;
  customTo: Date;
  onCustomFrom: (d: Date) => void;
  onCustomTo: (d: Date) => void;
}

export default function TimeRangeSelector({
  preset,
  onChange,
  customFrom,
  customTo,
  onCustomFrom,
  onCustomTo,
}: Props) {
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hr = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${hr}:${min}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="material-icons-round text-gray-400 text-lg">calendar_today</span>
      <select
        value={preset}
        onChange={(e) => onChange(e.target.value as TimePreset)}
        className="border border-gray-200 rounded-xl text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
      >
        {PRESETS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      {preset === 'custom' && (
        <>
          <input
            type="datetime-local"
            value={fmt(customFrom)}
            onChange={(e) => onCustomFrom(new Date(e.target.value))}
            className="border border-gray-200 rounded-xl text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <span className="text-gray-400 text-sm">→</span>
          <input
            type="datetime-local"
            value={fmt(customTo)}
            onChange={(e) => onCustomTo(new Date(e.target.value))}
            className="border border-gray-200 rounded-xl text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </>
      )}
    </div>
  );
}
