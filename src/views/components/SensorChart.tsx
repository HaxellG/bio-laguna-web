import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
} from 'recharts';
import { format } from 'date-fns';
import { SensorReading } from '../../models';
import { downloadChartAsImage, downloadCSV } from '../../utils/download';

interface Props {
  title: string;
  dataKey: keyof Omit<SensorReading, 'timestamp'>;
  color: string;
  unit: string;
  readings: SensorReading[];
  chartId: string;
  isLoading?: boolean;
}

export default function SensorChart({ title, dataKey, color, unit, readings, chartId, isLoading }: Props) {
  const data = readings.map((r) => ({
    time: format(r.timestamp, 'HH:mm'),
    [dataKey]: r[dataKey],
  }));

  const handleDownloadCSV = () => {
    const rows = readings.map((r) => ({
      timestamp: format(r.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      [dataKey]: r[dataKey],
    }));
    downloadCSV(rows, `${title.toLowerCase().replace(/\s+/g, '_')}.csv`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5" id={chartId}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
          >
            <span className="material-icons-round text-sm">table_chart</span>
            CSV
          </button>
          <button
            onClick={() => downloadChartAsImage(chartId, title)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
          >
            <span className="material-icons-round text-sm">image</span>
            IMG
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="w-full h-[200px] bg-gray-50 rounded-xl animate-pulse flex items-center justify-center border border-gray-100 mt-4">
            <span className="text-gray-400 text-sm font-medium">Cargando métricas...</span>
        </div>
      ) : readings.length === 0 ? (
        <div className="w-full h-[200px] bg-gray-50/50 rounded-xl flex flex-col items-center justify-center border border-dashed border-gray-200 gap-2 mt-4">
            <span className="material-icons-round text-gray-300 text-3xl">query_stats</span>
            <span className="text-gray-400 text-sm font-medium">No se encontraron datos para este rango</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              unit={unit}
            >
              <Label value={`${title}${unit ? ` (${unit})` : ''}`} angle={-90} position="insideLeft" style={{ fontSize: 10, fill: '#6b7280' }} />
            </YAxis>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px #0001', fontSize: 12 }}
              formatter={(v: number) => [`${v} ${unit}`, title]}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey={dataKey as string}
              stroke={color}
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
