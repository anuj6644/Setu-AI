declare module 'leaflet.markercluster' {
  import * as L from 'leaflet';
  
  namespace L {
    interface MarkerClusterGroupOptions {
      chunkedLoading?: boolean;
      spiderfyOnMaxZoom?: boolean;
      showCoverageOnHover?: boolean;
      zoomToBoundsOnClick?: boolean;
      maxClusterRadius?: number;
      iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
    }

    interface MarkerCluster {
      getChildCount(): number;
    }

    class MarkerClusterGroup extends L.LayerGroup {
      constructor(options?: MarkerClusterGroupOptions);
      addLayer(layer: L.Layer): this;
      removeLayer(layer: L.Layer): this;
      clearLayers(): this;
      eachLayer(fn: (layer: L.Layer) => void): this;
    }

    function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
  }
}

declare module 'leaflet.heat' {
  import * as L from 'leaflet';
  
  namespace L {
    interface HeatLayerOptions {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      gradient?: { [key: number]: string };
    }

    class HeatLayer extends L.Layer {
      constructor(latlngs: Array<[number, number, number?]>, options?: HeatLayerOptions);
    }

    function heatLayer(latlngs: Array<[number, number, number?]>, options?: HeatLayerOptions): HeatLayer;
  }

  interface Window {
    L: typeof L & {
      heatLayer: (latlngs: Array<[number, number, number?]>, options?: L.HeatLayerOptions) => L.HeatLayer;
    };
  }
}

// Global declarations
declare global {
  interface Window {
    L: typeof import('leaflet') & {
      heatLayer?: (latlngs: Array<[number, number, number?]>, options?: any) => any;
    };
  }
}
