import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { DOPrediction } from '../../models';
import { downloadCSV, downloadChartAsImage } from '../../utils/download';

const SAFE_THRESHOLD = 5; // mg/L – healthy minimum

interface Props {
  predictions: DOPrediction[];
}

export default function DOPredictionChart({ predictions }: Props) {
  const chartId = 'do-prediction-chart';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5" id={chartId}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-800 text-sm">Predicción de Oxígeno Disuelto</h4>
          <p className="text-xs text-gray-400 mt-0.5">Próximas 8 horas – estimado del modelo</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCSV(predictions.map((p) => ({ time: p.time, do_mg_L: p.value })), 'do_prediction.csv')}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
          >
            <span className="material-icons-round text-sm">table_chart</span>
            CSV
          </button>
          <button
            onClick={() => downloadChartAsImage(chartId, 'do_prediction')}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
          >
            <span className="material-icons-round text-sm">image</span>
            IMG
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={predictions} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="doGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a8fe3" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4a8fe3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 12]} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} unit=" mg/L" />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px #0001', fontSize: 12 }}
            formatter={(v: number) => [`${v} mg/L`, 'Predicción OD']}
          />
          <ReferenceLine y={SAFE_THRESHOLD} stroke="#ef4444" strokeDasharray="4 3" label={{ value: `⚠ ${SAFE_THRESHOLD} mg/L`, position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4a8fe3"
            strokeWidth={2}
            fill="url(#doGrad)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-2 mt-3">
        <span className="w-3 h-0.5 bg-red-400 inline-block rounded" style={{ borderTop: '2px dashed #ef4444', width: 20, display: 'inline-block' }}></span>
        <span className="text-xs text-gray-400">Umbral seguro ({SAFE_THRESHOLD} mg/L)</span>
      </div>
    </div>
  );
}
