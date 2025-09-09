import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '../MapDashboard.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InfrastructureData {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name: string;
    status: 'critical' | 'warning' | 'healthy';
    lastUpdated: string;
    vibration: number;
    strain: number;
    temperature: number;
    structureType?: string;
  };
}

interface FeatureCollection {
  type: 'FeatureCollection';
  features: InfrastructureData[];
}

const MapDashboard: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const heatmapLayerRef = useRef<L.Layer | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State management
  const [infrastructureData, setInfrastructureData] = useState<InfrastructureData[]>([]);
  const [filteredData, setFilteredData] = useState<InfrastructureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    critical: true,
    warning: true,
    healthy: true
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    healthy: 0,
    lastUpdate: new Date()
  });

  // Create custom SVG icons
  const createCustomIcon = useCallback((status: string, size = 25) => {
    const colors = {
      critical: '#ef4444',
      warning: '#f59e0b',
      healthy: '#22c55e'
    };

    const svgIcon = `
      <svg width="${size}" height="${size}" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12.5" cy="12.5" r="10" fill="${colors[status as keyof typeof colors]}" 
                stroke="#ffffff" stroke-width="2" opacity="0.9"/>
        <circle cx="12.5" cy="12.5" r="6" fill="#ffffff" opacity="0.8"/>
        <circle cx="12.5" cy="12.5" r="3" fill="${colors[status as keyof typeof colors]}"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker-icon',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090], // Delhi coordinates
      zoom: 10,
      zoomControl: false
    });

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Base layers
    const lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO'
    });

    // Set initial theme
    if (isDarkTheme) {
      darkLayer.addTo(map);
    } else {
      lightLayer.addTo(map);
    }

    // Initialize marker cluster group
    const markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let className = 'marker-cluster-small';
        if (count < 10) {
          className = 'marker-cluster-small';
        } else if (count < 100) {
          className = 'marker-cluster-medium';
        } else {
          className = 'marker-cluster-large';
        }
        
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: [40, 40]
        });
      }
    });

    markersRef.current = markerCluster;
    map.addLayer(markerCluster);

    mapRef.current = map;

    // Store layer references for theme switching
    (map as any)._lightLayer = lightLayer;
    (map as any)._darkLayer = darkLayer;

    return () => {
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Theme switching
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const lightLayer = (map as any)._lightLayer;
    const darkLayer = (map as any)._darkLayer;

    if (isDarkTheme) {
      if (map.hasLayer(lightLayer)) {
        map.removeLayer(lightLayer);
      }
      if (!map.hasLayer(darkLayer)) {
        map.addLayer(darkLayer);
      }
    } else {
      if (map.hasLayer(darkLayer)) {
        map.removeLayer(darkLayer);
      }
      if (!map.hasLayer(lightLayer)) {
        map.addLayer(lightLayer);
      }
    }
  }, [isDarkTheme]);

  // Create popup content
  const createPopupContent = useCallback((feature: InfrastructureData) => {
    const { properties } = feature;
    const statusClass = `status${properties.status.charAt(0).toUpperCase() + properties.status.slice(1)}`;
    
    return `
      <div style="min-width: 280px;">
        <div class="popupTitle">${properties.name}</div>
        <div class="popupId">ID: ${properties.id}</div>
        <div class="popupStatus ${statusClass}">
          <span class="statusDot dot${properties.status.charAt(0).toUpperCase() + properties.status.slice(1)}"></span>
          ${properties.status.toUpperCase()}
        </div>
        <div class="sensorGrid">
          <div class="sensorBox">
            <div class="sensorLabel">Vibration</div>
            <div><strong>${properties.vibration} Hz</strong></div>
          </div>
          <div class="sensorBox">
            <div class="sensorLabel">Strain</div>
            <div><strong>${properties.strain} με</strong></div>
          </div>
          <div class="sensorBox">
            <div class="sensorLabel">Temperature</div>
            <div><strong>${properties.temperature}°C</strong></div>
          </div>
        </div>
        <div class="popupFooter">
          <span>Last updated: ${new Date(properties.lastUpdated).toLocaleString()}</span>
        </div>
      </div>
    `;
  }, []);

  // Update markers on map
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    filteredData.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const marker = L.marker([lat, lng], {
        icon: createCustomIcon(feature.properties.status)
      });

      marker.bindPopup(createPopupContent(feature), {
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Add smooth animation
      marker.on('add', () => {
        const element = marker.getElement();
        if (element) {
          element.style.transform += ' scale(0)';
          element.style.transition = 'transform 0.3s ease-out';
          setTimeout(() => {
            element.style.transform = element.style.transform.replace('scale(0)', 'scale(1)');
          }, 50);
        }
      });

      if (clusteringEnabled) {
        markersRef.current!.addLayer(marker);
      } else {
        marker.addTo(mapRef.current!);
      }
    });
  }, [filteredData, createCustomIcon, createPopupContent, clusteringEnabled]);

  // Update heatmap
  const updateHeatmap = useCallback(() => {
    if (!mapRef.current) return;

    // Remove existing heatmap
    if (heatmapLayerRef.current) {
      mapRef.current.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (showHeatmap && window.L && (window.L as any).heatLayer) {
      const heatData = filteredData
        .filter(f => f.properties.status === 'critical' || f.properties.status === 'warning')
        .map(f => {
          const [lng, lat] = f.geometry.coordinates;
          const intensity = f.properties.status === 'critical' ? 1 : 0.6;
          return [lat, lng, intensity];
        });

      if (heatData.length > 0) {
        heatmapLayerRef.current = (window.L as any).heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: {
            0.2: '#22c55e',
            0.5: '#f59e0b', 
            0.8: '#ef4444'
          }
        });
        mapRef.current.addLayer(heatmapLayerRef.current);
      }
    }
  }, [showHeatmap, filteredData]);

  // Filter data based on search and status filters
  useEffect(() => {
    let filtered = infrastructureData;

    // Apply status filters
    filtered = filtered.filter(item => {
      return filters[item.properties.status as keyof typeof filters];
    });

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.properties.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.properties.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [infrastructureData, filters, searchTerm]);

  // Update markers when filtered data changes
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Update heatmap when relevant state changes
  useEffect(() => {
    updateHeatmap();
  }, [updateHeatmap]);

  // Calculate statistics
  useEffect(() => {
    const newStats = infrastructureData.reduce(
      (acc, item) => {
        acc.total++;
        acc[item.properties.status as keyof typeof acc]++;
        return acc;
      },
      { total: 0, critical: 0, warning: 0, healthy: 0, lastUpdate: new Date() }
    );
    setStats(newStats);
  }, [infrastructureData]);

  // Mock data for demonstration
  const generateMockData = useCallback((): FeatureCollection => {
    const mockFeatures: InfrastructureData[] = [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [77.22445, 28.63576] },
        properties: {
          id: 'DL101',
          name: 'ITO Flyover',
          status: 'warning',
          lastUpdated: new Date().toISOString(),
          vibration: 4.7,
          strain: 12.5,
          temperature: 32.1,
          structureType: 'flyover'
        }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [77.21827, 28.63943] },
        properties: {
          id: 'DL102',
          name: 'Delhi Metro Bridge',
          status: 'healthy',
          lastUpdated: new Date().toISOString(),
          vibration: 2.1,
          strain: 5.3,
          temperature: 31.5,
          structureType: 'bridge'
        }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [77.20711, 28.65195] },
        properties: {
          id: 'DL103',
          name: 'Kashmere Gate Overpass',
          status: 'critical',
          lastUpdated: new Date().toISOString(),
          vibration: 8.3,
          strain: 22.7,
          temperature: 35.4,
          structureType: 'overpass'
        }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [77.23711, 28.61195] },
        properties: {
          id: 'DL104',
          name: 'Nizamuddin Bridge',
          status: 'healthy',
          lastUpdated: new Date().toISOString(),
          vibration: 1.8,
          strain: 4.2,
          temperature: 30.8,
          structureType: 'bridge'
        }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [77.19711, 28.66195] },
        properties: {
          id: 'DL105',
          name: 'Ring Road Flyover',
          status: 'warning',
          lastUpdated: new Date().toISOString(),
          vibration: 5.2,
          strain: 15.1,
          temperature: 33.2,
          structureType: 'flyover'
        }
      }
    ];

    return { type: 'FeatureCollection', features: mockFeatures };
  }, []);

  // Initialize WebSocket connection
  const initWebSocket = useCallback(() => {
    try {
      // In a real implementation, replace with your WebSocket endpoint
      const ws = new WebSocket('wss://api.setu-ai.com/ws/infrastructure');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        
        // Clear polling fallback
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as FeatureCollection;
          setInfrastructureData(data.features);
          setStats(prev => ({ ...prev, lastUpdate: new Date() }));
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        
        // Start polling fallback
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(fetchData, 30000);
        }
        
        // Attempt to reconnect after 5 seconds
        setTimeout(initWebSocket, 5000);
      };

      ws.onerror = () => {
        setConnectionStatus('disconnected');
        // Start polling fallback immediately on error
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(fetchData, 30000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setConnectionStatus('disconnected');
      // Start polling fallback
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(fetchData, 30000);
      }
    }
  }, []);

  // Fetch data via API (polling fallback)
  const fetchData = useCallback(async () => {
    try {
      // In a real implementation, replace with your API endpoint
      // const response = await fetch('/api/infrastructure');
      // const data = await response.json() as FeatureCollection;
      
      // For demonstration, use mock data
      const data = generateMockData();
      setInfrastructureData(data.features);
      setStats(prev => ({ ...prev, lastUpdate: new Date() }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [generateMockData]);

  // Initialize data connection
  useEffect(() => {
    setLoading(true);
    
    // Try WebSocket first
    initWebSocket();
    
    // Initial data fetch
    fetchData();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [initWebSocket, fetchData]);

  // Load heatmap plugin dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Event handlers
  const handleSearch = useCallback(() => {
    // Search is handled by the useEffect above
  }, []);

  const toggleFilter = useCallback((filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  }, []);

  const toggleClustering = useCallback(() => {
    setClusteringEnabled(prev => {
      const newValue = !prev;
      
      if (mapRef.current && markersRef.current) {
        if (newValue) {
          // Enable clustering
          mapRef.current.addLayer(markersRef.current);
        } else {
          // Disable clustering - move markers to map directly
          mapRef.current.removeLayer(markersRef.current);
          markersRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              layer.addTo(mapRef.current!);
            }
          });
        }
      }
      
      return newValue;
    });
  }, []);

  return (
    <div className="mapDashboardRoot">
      {/* Side Panel */}
      <div className="sidePanel">
        <div className="panelHeader">
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            🏗️ Infrastructure Monitor
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: connectionStatus === 'connected' ? '#22c55e' : 
                               connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444'
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Search Section */}
        <div className="panelSection">
          <div className="sectionTitle">Search</div>
          <div className="searchRow">
            <input
              className="searchInput"
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="searchBtn" onClick={handleSearch}>
              🔍
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="panelSection">
          <div className="sectionTitle">Status Filters</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div 
              className={`statusPill ${filters.critical ? 'active' : ''}`}
              onClick={() => toggleFilter('critical')}
            >
              <span className="statusDot dotCritical" />
              Critical ({stats.critical})
            </div>
            <div 
              className={`statusPill ${filters.warning ? 'active' : ''}`}
              onClick={() => toggleFilter('warning')}
            >
              <span className="statusDot dotWarning" />
              Warning ({stats.warning})
            </div>
            <div 
              className={`statusPill ${filters.healthy ? 'active' : ''}`}
              onClick={() => toggleFilter('healthy')}
            >
              <span className="statusDot dotHealthy" />
              Healthy ({stats.healthy})
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="panelSection">
          <div className="sectionTitle">Map Controls</div>
          <div className="controlRow">
            <button 
              className={`controlBtn ${isDarkTheme ? 'active' : ''}`}
              onClick={() => setIsDarkTheme(!isDarkTheme)}
            >
              {isDarkTheme ? '🌙' : '☀️'} Theme
            </button>
            <button 
              className={`controlBtn ${showHeatmap ? 'active' : ''}`}
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              🔥 Heatmap
            </button>
            <button 
              className={`controlBtn ${clusteringEnabled ? 'active' : ''}`}
              onClick={toggleClustering}
            >
              📍 Cluster
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="panelSection">
          <div className="sectionTitle">Statistics</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Total Structures
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>
                {stats.lastUpdate.toLocaleTimeString()}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Last Update
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="mapPane">
        <div 
          ref={mapContainerRef} 
          id="map"
          style={{ height: '100vh', width: '100%' }}
        />
        
        {/* Loading Overlay */}
        {loading && (
          <div className="loadingOverlay">
            <div className="spinner" />
            <span>Loading infrastructure data...</span>
          </div>
        )}

        {/* Legend */}
        <div className="legendBox">
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Status Legend</div>
          <div className="legendRow">
            <div className="legendMarker legendCritical" />
            <span>Critical</span>
          </div>
          <div className="legendRow">
            <div className="legendMarker legendWarning" />
            <span>Warning</span>
          </div>
          <div className="legendRow">
            <div className="legendMarker legendHealthy" />
            <span>Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;
