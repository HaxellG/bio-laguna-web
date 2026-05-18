import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from 'recharts';
import { format } from 'date-fns';
import { CustomChart, SensorReading, SensorVariable } from '../../models';
import { downloadChartAsImage, downloadCSV } from '../../utils/download';

const LABELS: Record<SensorVariable, { label: string; unit: string; color: string }> = {
  temperature:      { label: 'Temperatura',      unit: '°C',   color: '#f97316' },
  ph:               { label: 'pH',               unit: '',     color: '#22c55e' },
  turbidity:        { label: 'Turbidez',         unit: 'NTU',  color: '#8b5cf6' },
  dissolved_oxygen: { label: 'Oxígeno Disuelto', unit: 'mg/L', color: '#3b82f6' },
};

interface Props {
  chart: CustomChart;
  readings: SensorReading[];
  onRemove: () => void;
}

export default function CustomChartCard({ chart, readings, onRemove }: Props) {
  const metaX = LABELS[chart.variableX];
  const metaY = LABELS[chart.variableY];
  const chartId = `custom-chart-${chart.id}`;

  const data = readings
    .filter((r) => r.timestamp >= chart.from && r.timestamp <= chart.to)
    .map((r) => ({ x: r[chart.variableX], y: r[chart.variableY] }));

  const handleCSV = () => {
    const rows = readings.map((r) => ({
      timestamp: format(r.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      [chart.variableX]: r[chart.variableX],
      [chart.variableY]: r[chart.variableY],
    }));
    downloadCSV(rows, `custom_${chart.variableX}_vs_${chart.variableY}.csv`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5" id={chartId}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800 text-sm">
          {metaX.label} vs {metaY.label}
        </h4>
        <div className="flex gap-2">
          <button
            onClick={handleCSV}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
          >
            <span className="material-icons-round text-sm">table_chart</span>
            CSV
          </button>
          <button
            onClick={() => downloadChartAsImage(chartId, `${chart.variableX}_vs_${chart.variableY}`)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
          >
            <span className="material-icons-round text-sm">image</span>
            IMG
          </button>
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
          >
            <span className="material-icons-round text-sm">delete</span>
          </button>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="w-full h-[220px] bg-gray-50/50 rounded-xl flex flex-col items-center justify-center border border-dashed border-gray-200 gap-2 mt-4">
            <span className="material-icons-round text-gray-300 text-3xl">query_stats</span>
            <span className="text-gray-400 text-sm font-medium">No se encontraron datos de cruce para estas variables</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 4, right: 8, left: -10, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="x" type="number" name={metaX.label} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}>
              <Label value={`${metaX.label}${metaX.unit ? ` (${metaX.unit})` : ''}`} offset={-8} position="insideBottom" style={{ fontSize: 10, fill: '#6b7280' }} />
            </XAxis>
            <YAxis dataKey="y" type="number" name={metaY.label} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}>
              <Label value={`${metaY.label}${metaY.unit ? ` (${metaY.unit})` : ''}`} angle={-90} position="insideLeft" style={{ fontSize: 10, fill: '#6b7280' }} />
            </YAxis>
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px #0001', fontSize: 12 }}
              formatter={(v: number, name: string) => [`${v}`, name]}
            />
            <Scatter data={data} fill={metaX.color} opacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
