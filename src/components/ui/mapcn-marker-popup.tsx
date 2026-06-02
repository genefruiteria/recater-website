"use client";

import MapLibreGL, { type MarkerOptions, type PopupOptions } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Locate, Maximize, Minus, Plus, X } from 'lucide-react';

import { cn } from '@/lib/utils';

const defaultStyles = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

type Theme = 'light' | 'dark';

function getDocumentTheme(): Theme | null {
  if (typeof document === 'undefined') return null;
  if (document.documentElement.classList.contains('dark')) return 'dark';
  if (document.documentElement.classList.contains('light')) return 'light';
  return null;
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function useResolvedTheme(themeProp?: Theme): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(() => getDocumentTheme() ?? getSystemTheme());

  useEffect(() => {
    if (themeProp) return;

    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme();
      if (docTheme) {
        setDetectedTheme(docTheme);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (event: MediaQueryListEvent) => {
      if (!getDocumentTheme()) {
        setDetectedTheme(event.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, [themeProp]);

  return themeProp ?? detectedTheme;
}

type MapViewport = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a Map component');
  }
  return context;
}

type MapStyleOption = string | MapLibreGL.StyleSpecification;
type MapRef = MapLibreGL.Map;

type MapProps = {
  children?: ReactNode;
  className?: string;
  theme?: Theme;
  styles?: {
    light?: MapStyleOption;
    dark?: MapStyleOption;
  };
  viewport?: Partial<MapViewport>;
  onViewportChange?: (viewport: MapViewport) => void;
  loading?: boolean;
} & Omit<MapLibreGL.MapOptions, 'container' | 'style'>;

function DefaultLoader() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-xs">
      <div className="flex gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function getViewport(map: MapLibreGL.Map): MapViewport {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

const Map = forwardRef<MapRef, MapProps>(function Map(
  { children, className, theme: themeProp, styles, viewport, onViewportChange, loading = false, ...props },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const resolvedTheme = useResolvedTheme(themeProp);
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  const mapStyles = useMemo(
    () => ({
      dark: styles?.dark ?? defaultStyles.dark,
      light: styles?.light ?? defaultStyles.light,
    }),
    [styles],
  );

  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: resolvedTheme === 'dark' ? mapStyles.dark : mapStyles.light,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
      ...viewport,
    });

    const loadHandler = () => setIsLoaded(true);
    const moveHandler = () => onViewportChangeRef.current?.(getViewport(map));

    map.on('load', loadHandler);
    map.on('move', moveHandler);
    setMapInstance(map);

    return () => {
      map.off('load', loadHandler);
      map.off('move', moveHandler);
      map.remove();
      setIsLoaded(false);
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.setStyle(resolvedTheme === 'dark' ? mapStyles.dark : mapStyles.light, { diff: true });
  }, [mapInstance, resolvedTheme, mapStyles]);

  const contextValue = useMemo(
    () => ({
      map: mapInstance,
      isLoaded,
    }),
    [mapInstance, isLoaded],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn('relative h-full w-full', className)}>
        {(!isLoaded || loading) && <DefaultLoader />}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

type MarkerContextValue = {
  marker: MapLibreGL.Marker;
  map: MapLibreGL.Map | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error('Marker components must be used within MapMarker');
  }
  return context;
}

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
} & Omit<MarkerOptions, 'element'>;

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();
  const callbacksRef = useRef({ onClick, onMouseEnter, onMouseLeave });
  callbacksRef.current = { onClick, onMouseEnter, onMouseLeave };

  const marker = useMemo(() => {
    const markerInstance = new MapLibreGL.Marker({
      ...markerOptions,
      element: document.createElement('div'),
      draggable,
    }).setLngLat([longitude, latitude]);

    markerInstance.getElement().addEventListener('click', (event) => callbacksRef.current.onClick?.(event));
    markerInstance
      .getElement()
      .addEventListener('mouseenter', (event) => callbacksRef.current.onMouseEnter?.(event));
    markerInstance
      .getElement()
      .addEventListener('mouseleave', (event) => callbacksRef.current.onMouseLeave?.(event));

    return markerInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;

    marker.addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, marker]);

  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) {
    marker.setLngLat([longitude, latitude]);
  }
  if (marker.isDraggable() !== draggable) {
    marker.setDraggable(draggable);
  }

  return <MarkerContext.Provider value={{ marker, map }}>{children}</MarkerContext.Provider>;
}

type MarkerContentProps = {
  children?: ReactNode;
  className?: string;
};

function MarkerContent({ children, className }: MarkerContentProps) {
  const { marker } = useMarkerContext();

  return createPortal(
    <div className={cn('relative cursor-pointer', className)}>{children || <DefaultMarkerIcon />}</div>,
    marker.getElement(),
  );
}

function DefaultMarkerIcon() {
  return <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />;
}

function PopupCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close popup"
      className="absolute top-0.5 right-0.5 z-10 inline-flex size-5 cursor-pointer items-center justify-center rounded-sm text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <X className="size-3.5" />
    </button>
  );
}

type MarkerPopupProps = {
  children: ReactNode;
  className?: string;
  closeButton?: boolean;
} & Omit<PopupOptions, 'className' | 'closeButton'>;

function MarkerPopup({ children, className, closeButton = false, ...popupOptions }: MarkerPopupProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement('div'), []);

  const popup = useMemo(
    () =>
      new MapLibreGL.Popup({
        offset: 16,
        ...popupOptions,
        closeButton: false,
      })
        .setMaxWidth('none')
        .setDOMContent(container),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!map) return;

    popup.setDOMContent(container);
    marker.setPopup(popup);

    return () => {
      marker.setPopup(null);
    };
  }, [map, marker, popup, container]);

  const handleClose = () => popup.remove();

  return createPortal(
    <div
      className={cn(
        'relative max-w-62 rounded-md border bg-popover p-3 text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95 duration-200 ease-out',
        className,
      )}
    >
      {closeButton && <PopupCloseButton onClick={handleClose} />}
      {children}
    </div>,
    container,
  );
}

type MarkerLabelProps = {
  children: ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
};

function MarkerLabel({ children, className, position = 'top' }: MarkerLabelProps) {
  const positionClasses = {
    top: 'bottom-full mb-1',
    bottom: 'top-full mt-1',
  };

  return (
    <div
      className={cn(
        'absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-foreground',
        positionClasses[position],
        className,
      )}
    >
      {children}
    </div>
  );
}

type MapControlsProps = {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showZoom?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
  className?: string;
};

const positionClasses = {
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-right': 'bottom-10 right-2',
};

function ControlButton({
  onClick,
  label,
  children,
  disabled = false,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      type="button"
      className="flex size-8 items-center justify-center transition-all hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50"
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function MapControls({
  position = 'bottom-right',
  showZoom = true,
  showLocate = false,
  showFullscreen = false,
  className,
}: MapControlsProps) {
  const { map } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);

  const handleZoomIn = useCallback(() => map?.zoomTo(map.getZoom() + 1, { duration: 300 }), [map]);
  const handleZoomOut = useCallback(() => map?.zoomTo(map.getZoom() - 1, { duration: 300 }), [map]);
  const handleLocate = useCallback(() => {
    setWaitingForLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map?.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 14,
            duration: 1500,
          });
          setWaitingForLocation(false);
        },
        () => setWaitingForLocation(false),
      );
    }
  }, [map]);
  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer();
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, [map]);

  return (
    <div className={cn('absolute z-10 flex flex-col gap-1.5', positionClasses[position], className)}>
      {showZoom && (
        <div className="flex flex-col overflow-hidden rounded-md border border-border bg-background shadow-sm [&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-border">
          <ControlButton onClick={handleZoomIn} label="Zoom in">
            <Plus className="size-4" />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} label="Zoom out">
            <Minus className="size-4" />
          </ControlButton>
        </div>
      )}
      {showLocate && (
        <div className="overflow-hidden rounded-md border border-border bg-background shadow-sm">
          <ControlButton onClick={handleLocate} label="Find my location" disabled={waitingForLocation}>
            {waitingForLocation ? <Loader2 className="size-4 animate-spin" /> : <Locate className="size-4" />}
          </ControlButton>
        </div>
      )}
      {showFullscreen && (
        <div className="overflow-hidden rounded-md border border-border bg-background shadow-sm">
          <ControlButton onClick={handleFullscreen} label="Toggle fullscreen">
            <Maximize className="size-4" />
          </ControlButton>
        </div>
      )}
    </div>
  );
}

export { Map, useMap, MapMarker, MarkerContent, MarkerPopup, MarkerLabel, MapControls };
export type { MapRef, MapViewport };
