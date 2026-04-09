import { useState, useCallback, useEffect, useMemo } from 'react';
import { subHours, subDays } from 'date-fns';
import {
  getZones,
  getAllDevices,
  getLatestReading,
  getLatestReadingByDeviceCodes,
  getReadingsInRange,
  getReadingsByDeviceCodes,
  getDOPredictions,
} from '../services/sensorService';
import { CustomChart, FilterMode, SensorVariable, Zone, Device, SensorReading, DOPrediction } from '../models';

export type TimePreset = '1h' | '6h' | '24h' | '7d' | 'custom';

function presetToDates(preset: TimePreset): { from: Date; to: Date } {
  const to = new Date();
  switch (preset) {
    case '1h':  return { from: subHours(to, 1), to };
    case '6h':  return { from: subHours(to, 6), to };
    case '24h': return { from: subHours(to, 24), to };
    case '7d':  return { from: subDays(to, 7), to };
    default:    return { from: subHours(to, 1), to };
  }
}

export function useDashboard() {
  const [filterMode, setFilterMode] = useState<FilterMode>('zone');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [selectedDeviceCodes, setSelectedDeviceCodes] = useState<string[]>([]);
  const [preset, setPreset] = useState<TimePreset>('1h');
  const [customFrom, setCustomFrom] = useState<Date>(subHours(new Date(), 1));
  const [customTo, setCustomTo] = useState<Date>(new Date());
  const [customCharts, setCustomCharts] = useState<CustomChart[]>([]);

  const [zones, setZones] = useState<Zone[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [totalDevices, setTotalDevices] = useState(0);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [doPredictions, setDoPredictions] = useState<DOPrediction[]>([]);

  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [isLoadingLatest, setIsLoadingLatest] = useState(false);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load Initial Metadata
  useEffect(() => {
    (async () => {
      try {
        setGlobalError(null);
        const [zonesData, devicesData, predictionsData] = await Promise.all([
          getZones(),
          getAllDevices(),
          getDOPredictions()
        ]);
        setZones(zonesData);
        if (zonesData.length > 0 && !selectedZoneId) {
          setSelectedZoneId(zonesData[0].id);
        }
        setAllDevices(devicesData);
        setTotalDevices(devicesData.length);
        setDoPredictions(predictionsData);
      } catch (err: any) {
        console.error('Failed to load initial metadata:', err);
        setGlobalError('Error de conexión con el servidor (Initial Data).');
      } finally {
        setIsLoadingInit(false);
      }
    })();
  }, []); // Only once

  const { from, to } = useMemo(() => {
    return preset === 'custom'
      ? { from: customFrom, to: customTo }
      : presetToDates(preset);
  }, [preset, customFrom, customTo]);

  // Load Latest Reading
  useEffect(() => {
    let active = true;
    (async () => {
      if (!selectedZoneId && selectedDeviceCodes.length === 0) return;
      try {
        setIsLoadingLatest(true);
        setGlobalError(null);
        let data = null;
        if (filterMode === 'zone') {
          if (selectedZoneId) {
             data = await getLatestReading(selectedZoneId);
          }
        } else {
          if (selectedDeviceCodes.length > 0) {
             data = await getLatestReadingByDeviceCodes(selectedDeviceCodes);
          }
        }
        if (active) setLatestReading(data);
      } catch (err) {
        console.error('Failed to load latest reading:', err);
        if (active) setGlobalError('Error cargando los KPIs en tiempo real.');
      } finally {
        if (active) setIsLoadingLatest(false);
      }
    })();
    return () => { active = false; };
  }, [filterMode, selectedZoneId, selectedDeviceCodes]);

  // Load Series
  useEffect(() => {
    let active = true;
    (async () => {
      if (!selectedZoneId && selectedDeviceCodes.length === 0) return;
      try {
        setIsLoadingSeries(true);
        setGlobalError(null);
        let data: SensorReading[] = [];
        if (filterMode === 'zone' && selectedZoneId) {
          data = await getReadingsInRange(selectedZoneId, from, to);
        } else if (filterMode === 'device' && selectedDeviceCodes.length > 0) {
          data = await getReadingsByDeviceCodes(selectedDeviceCodes, from, to);
        }
        if (active) setReadings(data);
      } catch (err) {
        console.error('Failed to load timeline readings:', err);
        if (active) setGlobalError('Error cargando el historial de datos.');
      } finally {
        if (active) setIsLoadingSeries(false);
      }
    })();
    return () => { active = false; };
  }, [filterMode, selectedZoneId, selectedDeviceCodes, from, to]);

  const addCustomChart = useCallback(
    (varX: SensorVariable, varY: SensorVariable, cfrom: Date, cto: Date) => {
      setCustomCharts((prev) => [
        ...prev,
        { id: Date.now().toString(), variableX: varX, variableY: varY, from: cfrom, to: cto },
      ]);
    },
    [],
  );

  const removeCustomChart = useCallback((id: string) => {
    setCustomCharts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
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
  };
}
