import { lazy, Suspense, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { useDashboard } from '../../../controllers/dashboardController';
import SensorCard from '../../components/SensorCard';
import SensorChart from '../../components/SensorChart';
import DOPredictionChart from '../../components/DOPredictionChart';
import CustomChartCard from '../../components/CustomChartCard';
import TimeRangeSelector from '../../components/TimeRangeSelector';
import { FilterMode, SensorVariable, MapDevice, DeviceReading } from '../../../models';
import { downloadCSV } from '../../../utils/download';
import { getMapDevices, getDeviceReading } from '../../../services/sensorService';

const ZoneMap = lazy(() => import('../../components/ZoneMap'));

const VARIABLE_OPTIONS: { value: SensorVariable; label: string }[] = [
  { value: 'temperature', label: 'Temperatura (°C)' },
  { value: 'ph',          label: 'pH'               },
  { value: 'turbidity',   label: 'Turbidez (NTU)'   },
];

export default function DashboardPage() {
  const {
    zones,
    totalDevices,
    allDevices,
    filterMode,
    setFilterMode,
    selectedZoneId,
    setSelectedZoneId,
    selectedDeviceCodes,
    setSelectedDeviceCodes,
    latestReading,
    readings,
    doPredictions,
    preset,
    setPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    customCharts,
    addCustomChart,
    removeCustomChart,
    isLoadingInit,
    isLoadingLatest,
    isLoadingSeries,
    globalError,
  } = useDashboard();

  // ── Map devices state (new: from get_devices_latest_location) ──────────
  const [mapDevices, setMapDevices] = useState<MapDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [deviceReading, setDeviceReading] = useState<DeviceReading | null>(null);
  const [isLoadingDeviceReading, setIsLoadingDeviceReading] = useState(false);

  // Load map devices on mount
  useEffect(() => {
    (async () => {
      try {
        const devices = await getMapDevices();
        setMapDevices(devices);
      } catch (err) {
        console.error('Failed to load map devices:', err);
      }
    })();
  }, []);

  const filteredMapDevices = useMemo(() => {
    if (filterMode === 'device' && selectedDeviceCodes.length > 0) {
      return mapDevices.filter(d => selectedDeviceCodes.includes(d.device_id));
    }
    return mapDevices;
  }, [mapDevices, filterMode, selectedDeviceCodes]);

  // Handle buoy click on the map
  const handleDeviceClick = useCallback(async (deviceId: string) => {
    // Toggle: click same buoy again to deselect
    if (selectedDeviceId === deviceId) {
      setSelectedDeviceId(null);
      setDeviceReading(null);
      return;
    }

    setSelectedDeviceId(deviceId);
    setIsLoadingDeviceReading(true);
    setDeviceReading(null);
    try {
      const reading = await getDeviceReading(deviceId);
      setDeviceReading(reading);
    } catch (err) {
      console.error('Failed to load device reading:', err);
    } finally {
      setIsLoadingDeviceReading(false);
    }
  }, [selectedDeviceId]);

  // Handle when the popup is closed manually via "X" or when switching
  const handleDeviceClose = useCallback((deviceId: string) => {
    setSelectedDeviceId((prev) => (prev === deviceId ? null : prev));
  }, []);

  // Sync deviceReading clear when selectedDeviceId is cleared
  useEffect(() => {
    if (!selectedDeviceId) {
      setDeviceReading(null);
    }
  }, [selectedDeviceId]);

  // Device code input state
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddCode = () => {
    const code = codeInput.trim();
    if (!code) return;
    const device = allDevices.find((d) => d.code === code);
    if (!device) {
      setCodeError(`Código "${code}" no encontrado`);
      return;
    }
    if (selectedDeviceCodes.includes(code)) {
      setCodeError(`El dispositivo "${code}" ya fue agregado`);
      return;
    }
    setSelectedDeviceCodes([...selectedDeviceCodes, code]);
    setCodeInput('');
    setCodeError('');
    inputRef.current?.focus();
  };

  const handleRemoveCode = (code: string) => {
    setSelectedDeviceCodes(selectedDeviceCodes.filter((c) => c !== code));
  };

  const handleModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setCodeError('');
    setCodeInput('');
  };

  // Custom chart form state
  const [formVarX, setFormVarX] = useState<SensorVariable>('temperature');
  const [formVarY, setFormVarY] = useState<SensorVariable>('ph');
  const [formFrom, setFormFrom] = useState(customFrom);
  const [formTo, setFormTo]     = useState(customTo);

  const fmtDt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hr = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${hr}:${min}`;
  };

  const handleDownloadAllCSV = () => {
    const rows = readings.map((r) => ({
      timestamp: format(r.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      temperature_C: r.temperature,
      ph: r.ph,
      turbidity_NTU: r.turbidity,
    }));
    downloadCSV(rows, `bio_analytics_${selectedZoneId}.csv`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1100px] mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Monitoreo ambiental en tiempo real</p>
      </div>

      {globalError && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-3">
          <span className="material-icons-round">error_outline</span>
          <p className="text-sm font-medium">{globalError}</p>
        </div>
      )}

      {/* ── Active Bio-Lagunas (contains map + in-card device readings) ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="material-icons-round text-primary-500 text-2xl">sensors</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Bio-Lagunas Activas</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none flex items-center gap-2">
                {isLoadingInit ? <span className="animate-pulse h-6 w-8 bg-gray-200 rounded inline-block" /> : filteredMapDevices.length}
                <span className="text-base font-medium text-gray-400">Dispositivos</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Filter Panel ──────────────────────────────────────────────── */}
        <div className="border border-gray-100 rounded-2xl bg-gray-50 p-4 space-y-4">
          {/* Mode toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Filtrar datos por:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange('zone')}
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl border transition-colors ${
                  filterMode === 'zone'
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                <span className="material-icons-round text-base">map</span>
                Zona
              </button>
              <button
                onClick={() => handleModeChange('device')}
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl border transition-colors ${
                  filterMode === 'device'
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                <span className="material-icons-round text-base">memory</span>
                Dispositivo
              </button>
            </div>
          </div>

          {/* Zone selector */}
          {filterMode === 'zone' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Selecciona una zona disponible:</p>
              <div className="flex flex-wrap gap-2">
                {zones.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZoneId(z.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      selectedZoneId === z.id
                        ? 'bg-primary-50 border-primary-400 text-primary-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selectedZoneId === z.id ? 'bg-primary-500' : 'bg-gray-300'}`} />
                    {z.name}
                    <span className="text-xs font-normal text-gray-400">{z.deviceCount} dispositivos</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Device code selector */}
          {filterMode === 'device' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-medium">Escribe el código de uno o varios dispositivos:</p>

              {/* Input row */}
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 min-w-[160px]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={codeInput}
                    onChange={(e) => { setCodeInput(e.target.value.trim()); setCodeError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCode()}
                    placeholder="Ej: buoy_live_01"
                    list="device-codes-list"
                    className="w-full border border-gray-200 rounded-xl text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder:text-gray-400"
                  />
                  <datalist id="device-codes-list">
                    {allDevices
                      .filter((d) => !selectedDeviceCodes.includes(d.code))
                      .map((d) => (
                        <option key={d.code} value={d.code}>{d.code} — {d.zoneName}</option>
                      ))}
                  </datalist>
                </div>
                <button
                  onClick={handleAddCode}
                  className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  <span className="material-icons-round text-base">add</span>
                  Agregar
                </button>
              </div>

              {/* Error */}
              {codeError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="material-icons-round text-sm">error_outline</span>
                  {codeError}
                </p>
              )}

              {/* Selected device tags */}
              {selectedDeviceCodes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDeviceCodes.map((code) => {
                    const dev = allDevices.find((d) => d.code === code);
                    return (
                      <span
                        key={code}
                        className="flex items-center gap-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                      >
                        <span className="material-icons-round text-sm">memory</span>
                        {code}
                        {dev && <span className="font-normal text-primary-500">· {dev.zoneName.split('–')[0].trim()}</span>}
                        <button
                          onClick={() => handleRemoveCode(code)}
                          className="ml-0.5 hover:text-red-500 transition-colors"
                          aria-label={`Eliminar ${code}`}
                        >
                          <span className="material-icons-round text-sm">close</span>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {selectedDeviceCodes.length === 0 && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="material-icons-round text-sm">info</span>
                  Ningún dispositivo seleccionado. Agrega al menos uno para ver datos.
                </p>
              )}

              {/* Available codes hint */}
              <details className="text-xs text-gray-400">
                <summary className="cursor-pointer select-none hover:text-gray-600 transition-colors">
                  Ver códigos disponibles
                </summary>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {allDevices.map((d) => (
                    <button
                      key={d.code}
                      onClick={() => { setCodeInput(d.code); inputRef.current?.focus(); }}
                      disabled={selectedDeviceCodes.includes(d.code)}
                      className="px-2 py-0.5 rounded-lg border text-xs font-mono transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-gray-200 hover:border-primary-300 hover:text-primary-600 bg-white"
                    >
                      {d.code}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Map */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Vista de Despliegue Global</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {zones.map((z) => (
              <div key={z.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 inline-block"></span>
                <span className="text-xs font-medium text-gray-600">{z.name}:</span>
                <span className="text-xs text-gray-500">{z.deviceCount} Dispositivos</span>
              </div>
            ))}
          </div>
          <Suspense fallback={<div className="w-full h-80 sm:h-96 bg-gray-100 rounded-xl animate-pulse" />}>
            <ZoneMap
              zones={zones}
              mapDevices={filteredMapDevices}
              selectedDeviceId={selectedDeviceId}
              onDeviceClick={handleDeviceClick}
              onDeviceClose={handleDeviceClose}
            />
          </Suspense>

          {/* Hint to click a buoy */}
          {!selectedDeviceId && filteredMapDevices.length > 0 && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5 justify-center">
              <span className="material-icons-round text-sm">touch_app</span>
              Haz clic en una boya del mapa para ver sus lecturas en tiempo real
            </p>
          )}
        </div>

        {/* ── In-card device reading panel (appears on buoy click) ──────── */}
        {selectedDeviceId && (
          <div key={selectedDeviceId} className="sensor-panel-enter">
            <div className="border border-primary-100 rounded-2xl bg-gradient-to-br from-primary-50/60 to-white p-4 space-y-3">
              {/* Panel header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                    <span className="material-icons-round text-primary-600" style={{ fontSize: '20px' }}>sensors</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Monitoreo en Tiempo Real</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="material-icons-round" style={{ fontSize: '12px' }}>memory</span>
                      <span className="font-medium text-primary-600">{selectedDeviceId}</span>
                      {deviceReading && (
                        <>
                          <span className="text-gray-300 mx-0.5">·</span>
                          <span>{format(deviceReading.timestamp, 'dd/MM/yyyy HH:mm:ss')}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedDeviceId(null); setDeviceReading(null); }}
                  className="p-1.5 rounded-xl hover:bg-white/80 text-gray-400 hover:text-gray-600 transition-all"
                  aria-label="Cerrar panel de lecturas"
                >
                  <span className="material-icons-round" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>

              {/* Sensor cards grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SensorCard
                  label="Temperatura"
                  value={deviceReading?.temperature.toFixed(1) ?? '–'}
                  unit="°C"
                  icon="thermostat"
                  color="text-orange-500"
                  isLoading={isLoadingDeviceReading}
                />
                <SensorCard
                  label="Nivel de pH"
                  value={deviceReading?.ph.toFixed(2) ?? '–'}
                  unit=""
                  icon="science"
                  color="text-green-500"
                  isLoading={isLoadingDeviceReading}
                />
                <SensorCard
                  label="Turbidez"
                  value={deviceReading?.turbidity.toFixed(2) ?? '–'}
                  unit="NTU"
                  icon="waves"
                  color="text-violet-500"
                  isLoading={isLoadingDeviceReading}
                />
                <SensorCard
                  label="Oxígeno Disuelto"
                  value={deviceReading?.dissolved_oxygen?.toFixed(2) ?? '–'}
                  unit="mg/L"
                  icon="water_drop"
                  color="text-blue-500"
                  isLoading={isLoadingDeviceReading}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── DO Prediction ───────────────────────────────────────────────── */}
      <section className="space-y-2">
        <h2 className="font-bold text-gray-900 text-lg">Modelo de Predicciones</h2>
        <DOPredictionChart predictions={doPredictions} />
      </section>

      {/* ── Historical Analysis ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-bold text-gray-900 text-lg">Análisis Histórico</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <TimeRangeSelector
              preset={preset}
              onChange={setPreset}
              customFrom={customFrom}
              customTo={customTo}
              onCustomFrom={setCustomFrom}
              onCustomTo={setCustomTo}
            />
            <button
              onClick={handleDownloadAllCSV}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600 border border-gray-200 rounded-xl px-3 py-1.5 transition-colors"
            >
              <span className="material-icons-round text-sm">download</span>
              Descargar todo CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SensorChart title="Variación de Temperatura" dataKey="temperature" color="#f97316" unit="°C"  readings={readings} chartId="hist-temp" isLoading={isLoadingSeries} />
          <SensorChart title="Estabilidad de pH"         dataKey="ph"          color="#22c55e" unit=""    readings={readings} chartId="hist-ph"   isLoading={isLoadingSeries} />
          <SensorChart title="Niveles de Turbidez"       dataKey="turbidity"   color="#8b5cf6" unit=" NTU" readings={readings} chartId="hist-turb" isLoading={isLoadingSeries} />
        </div>
      </section>

      {/* ── Custom Report Generator ──────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-bold text-gray-900 text-lg">Generador de Reportes Personalizados</h2>
        <p className="text-sm text-gray-400 -mt-2">Análisis de correlación y comparación multivariable</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Variable X</label>
              <select
                value={formVarX}
                onChange={(e) => setFormVarX(e.target.value as SensorVariable)}
                className="w-full border border-gray-200 rounded-xl text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {VARIABLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Variable Y</label>
              <select
                value={formVarY}
                onChange={(e) => setFormVarY(e.target.value as SensorVariable)}
                className="w-full border border-gray-200 rounded-xl text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {VARIABLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Rango de fechas – Desde</label>
              <input type="datetime-local" value={fmtDt(formFrom)} onChange={(e) => setFormFrom(new Date(e.target.value))}
                className="w-full border border-gray-200 rounded-xl text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Rango de fechas – Hasta</label>
              <input type="datetime-local" value={fmtDt(formTo)} onChange={(e) => setFormTo(new Date(e.target.value))}
                className="w-full border border-gray-200 rounded-xl text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
          </div>
          <button
            onClick={() => addCustomChart(formVarX, formVarY, formFrom, formTo)}
            className="mt-4 flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <span className="material-icons-round text-sm">add_chart</span>
            Agregar Gráfica
          </button>
        </div>

        {customCharts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm gap-3 text-gray-400">
            <span className="material-icons-round text-4xl">bar_chart_4_bars</span>
            <p className="text-sm font-medium">Aún no hay gráficas personalizadas.</p>
            <p className="text-xs">Define tus variables y haz clic en "Agregar Gráfica" para comenzar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {customCharts.map((c) => (
              <CustomChartCard
                key={c.id}
                chart={c}
                readings={readings}
                onRemove={() => removeCustomChart(c.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="text-center text-xs text-gray-400 pb-4 pt-2 border-t border-gray-100">
        © Bio-Laguna 2026. Todos los derechos reservados.&nbsp;·&nbsp;
        <a href="#" className="hover:text-primary-500 transition-colors">Política de Privacidad</a>&nbsp;·&nbsp;
        <a href="#" className="hover:text-primary-500 transition-colors">Términos de Servicio</a>&nbsp;·&nbsp;
        <a href="#" className="hover:text-primary-500 transition-colors">Soporte</a>
      </footer>
    </div>
  );
}
