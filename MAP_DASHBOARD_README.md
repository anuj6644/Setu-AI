# Setu AI Infrastructure Monitoring Map Dashboard

## Overview

The interactive map dashboard provides real-time monitoring of infrastructure health across India using Leaflet.js, WebSocket connections, and advanced visualization features. This system displays critical infrastructure data with color-coded markers, clustering, heatmaps, and comprehensive filtering capabilities.

## Features Implemented

### 🗺️ **Interactive Map Interface**
- **Base Layers**: OpenStreetMap (light) and CartoDB Dark Matter (dark theme)
- **Theme Toggle**: Switch between light and dark map themes
- **Zoom Controls**: Positioned at bottom-left for easy access
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📍 **Custom Marker System**
- **Color-coded SVG Markers**:
  - 🔴 **Red**: Critical infrastructure (immediate attention needed)
  - 🟠 **Orange**: Warning infrastructure (showing signs of stress)
  - 🟢 **Green**: Healthy infrastructure (normal operation)
- **Smooth Animations**: Markers scale in with CSS transitions
- **Interactive Popups**: Detailed information on click

### 🔗 **Real-time Data Integration**
- **WebSocket Connection**: Primary real-time data source
- **Polling Fallback**: 30-second intervals when WebSocket unavailable
- **Connection Status Indicator**: Visual feedback for connection state
- **Error Handling**: Graceful fallback mechanisms

### 🎛️ **Interactive Controls**
- **Search Functionality**: Find infrastructure by name or ID
- **Status Filters**: Show/hide markers by health status
- **Map Controls**: Toggle theme, heatmap, and clustering
- **Statistics Panel**: Real-time counts and last update time

### 📊 **Advanced Visualizations**
- **Marker Clustering**: Groups nearby markers for better performance
- **Heatmap Layer**: Shows concentration of critical/warning infrastructure
- **Custom Cluster Icons**: Color-coded by density
- **Legend**: Clear explanation of status colors

### ⚡ **Performance Optimizations**
- **Lazy Loading**: Efficient marker management
- **Chunked Loading**: Smooth performance with large datasets
- **Loading Indicators**: User feedback during data fetching
- **Memory Management**: Proper cleanup of map layers

## Usage Instructions

### Accessing the Dashboard
1. Navigate to `http://localhost:8080/map` in your browser
2. The dashboard will automatically load with mock data for demonstration

### Navigation Controls
- **Pan**: Click and drag to move around the map
- **Zoom**: Use mouse wheel or zoom controls (bottom-left)
- **Reset View**: Double-click to reset to original view

### Side Panel Features

#### Search
- Type infrastructure name or ID in the search box
- Results filter in real-time as you type
- Press Enter or click search icon to activate

#### Status Filters
- **Critical Filter**: Toggle red markers on/off
- **Warning Filter**: Toggle orange markers on/off
- **Healthy Filter**: Toggle green markers on/off
- Numbers show current count for each status

#### Map Controls
- **🌙/☀️ Theme**: Switch between dark and light map themes
- **🔥 Heatmap**: Toggle heatmap overlay for critical areas
- **📍 Cluster**: Enable/disable marker clustering

#### Statistics
- **Total Structures**: Current infrastructure count
- **Last Update**: Timestamp of most recent data refresh

### Marker Interactions
1. **Click any marker** to view detailed popup with:
   - Structure name and ID
   - Current health status
   - Latest sensor readings (vibration, strain, temperature)
   - Last update timestamp

2. **Hover effects** show visual feedback
3. **Clustered markers** can be clicked to zoom in

### Data Format
The system expects GeoJSON data in this format:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.22445, 28.63576]
      },
      "properties": {
        "id": "DL101",
        "name": "ITO Flyover",
        "status": "warning",
        "lastUpdated": "2023-10-25T14:30:00Z",
        "vibration": 4.7,
        "strain": 12.5,
        "temperature": 32.1,
        "structureType": "flyover"
      }
    }
  ]
}
```

## Technical Implementation

### Technologies Used
- **React 18** with TypeScript
- **Leaflet.js** for interactive maps
- **MarkerCluster** plugin for performance
- **Leaflet.heat** plugin for heatmaps
- **WebSocket API** for real-time updates
- **CSS Grid/Flexbox** for responsive layouts

### Key Components
- `MapDashboard.tsx` - Main dashboard component
- `MapDashboardPage.tsx` - Route wrapper
- `MapDashboard.css` - Custom styling
- `leaflet.d.ts` - TypeScript declarations

### API Endpoints (for integration)
- **WebSocket**: `wss://api.setu-ai.com/ws/infrastructure`
- **REST API**: `GET /api/infrastructure` (polling fallback)

## Customization

### Adding New Infrastructure Types
1. Update the `InfrastructureData` interface
2. Add new status colors in CSS variables
3. Update marker creation logic
4. Extend popup template

### Modifying Update Intervals
```typescript
// Change polling interval (default: 30 seconds)
pollingIntervalRef.current = setInterval(fetchData, 60000); // 60 seconds
```

### Custom Map Themes
Add new tile layers in the map initialization:
```typescript
const customLayer = L.tileLayer('https://your-tile-server/{z}/{x}/{y}.png', {
  attribution: 'Your attribution'
});
```

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations
- **Marker Clustering**: Automatically enabled for >50 markers
- **Heatmap**: Only shows critical/warning infrastructure
- **Memory Management**: Layers properly removed on cleanup
- **Lazy Loading**: Popups content loaded on demand

## Troubleshooting

### Map Not Loading
1. Check console for JavaScript errors
2. Verify internet connection for tile loading
3. Ensure all dependencies are installed

### WebSocket Connection Issues
- Dashboard automatically falls back to polling
- Check network configuration for WebSocket support
- Verify API endpoint accessibility

### Performance Issues
- Enable clustering for large datasets
- Disable heatmap for lower-end devices
- Reduce update frequency if needed

## Future Enhancements
- Timeline slider for historical data
- Export functionality for infrastructure reports
- Mobile app integration
- Advanced analytics dashboard
- Multi-language support

---

**Contact**: For technical support or feature requests, contact the Setu AI development team.
