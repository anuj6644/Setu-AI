import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SensorReading {
  id: string;
  structure_id: string;
  structure_name: string;
  vibration_frequency: number;
  humidity: number;
  strain_measurement: number;
  temperature: number;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  latitude: number;
  longitude: number;
}

export const useSensorData = () => {
  const { user } = useAuth();
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [latestReadings, setLatestReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensorData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch all sensor data
      const { data: allData, error: allError } = await supabase
        .from('sensor_data')
        .select('*')
        .order('timestamp', { ascending: false });

      if (allError) throw allError;

      // Fetch latest readings per structure
      const { data: latestData, error: latestError } = await supabase
        .from('sensor_data')
        .select('*')
        .order('timestamp', { ascending: false });

      if (latestError) throw latestError;

      // Cast the data to our interface to handle the type assertion
      const typedAllData = allData?.map(item => ({
        ...item,
        status: item.status as 'healthy' | 'warning' | 'critical'
      })) as SensorReading[] || [];

      const typedLatestData = latestData?.map(item => ({
        ...item,
        status: item.status as 'healthy' | 'warning' | 'critical'
      })) as SensorReading[] || [];

      // Group by structure_id and get latest reading for each
      const latestByStructure = typedLatestData.reduce((acc, reading) => {
        if (!acc[reading.structure_id] || 
            new Date(reading.timestamp) > new Date(acc[reading.structure_id].timestamp)) {
          acc[reading.structure_id] = reading;
        }
        return acc;
      }, {} as Record<string, SensorReading>);

      setSensorData(typedAllData);
      setLatestReadings(Object.values(latestByStructure));
      setError(null);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSensorData();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('sensor-data-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sensor_data'
          },
          () => {
            fetchSensorData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    sensorData,
    latestReadings,
    loading,
    error,
    refetch: fetchSensorData
  };
};