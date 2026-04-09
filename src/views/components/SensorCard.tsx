interface Props {
  label: string;
  value: string | number;
  unit: string;
  icon: string;
  color?: string;
  isLoading?: boolean;
}

export default function SensorCard({ label, value, unit, icon, color = 'text-primary-500', isLoading }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col gap-2">
      <div className={`flex items-center gap-2 ${color}`}>
        <span className="material-icons-round text-xl">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      {isLoading ? (
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mt-1" />
      ) : (
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">
          {value}
          <span className="text-base font-medium text-gray-400 ml-1">{unit}</span>
        </p>
      )}
    </div>
  );
}
