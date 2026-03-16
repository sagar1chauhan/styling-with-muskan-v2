import React, { useEffect, useRef, useState } from "react";

const loadGoogleMaps = (key) => {
  if (!key) return Promise.reject(new Error("Missing Google Maps key"));
  if (window.google?.maps) return Promise.resolve();
  const existing = document.getElementById("google-maps-js");
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => resolve());
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "google-maps-js";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
};

const LiveMap = ({ userLocation, providerLocation, className = "", height = 192, bikeIconUrl = "/bike-marker.svg" }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  const providerMarker = useRef(null);
  const [ready, setReady] = useState(false);
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps(key)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [key]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const center = providerLocation || userLocation;
    if (!center) return;
    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });
    } else {
      mapInstance.current.setCenter(center);
    }
    if (userLocation) {
      if (!userMarker.current) {
        userMarker.current = new window.google.maps.Marker({
          position: userLocation,
          map: mapInstance.current,
          title: "Customer",
        });
      } else {
        userMarker.current.setPosition(userLocation);
      }
    }
    if (providerLocation) {
      if (!providerMarker.current) {
        providerMarker.current = new window.google.maps.Marker({
          position: providerLocation,
          map: mapInstance.current,
          title: "Provider",
          icon: {
            url: bikeIconUrl,
            scaledSize: new window.google.maps.Size(36, 36),
          },
        });
      } else {
        providerMarker.current.setPosition(providerLocation);
      }
    }
  }, [ready, userLocation?.lat, userLocation?.lng, providerLocation?.lat, providerLocation?.lng, bikeIconUrl]);

  const hasLocation = !!(userLocation || providerLocation);
  if (!key) {
    return (
      <div className={`flex items-center justify-center bg-muted/40 text-xs text-muted-foreground ${className}`} style={{ height }}>
        Google Maps key missing
      </div>
    );
  }
  if (!hasLocation) {
    return (
      <div className={`flex items-center justify-center bg-muted/40 text-xs text-muted-foreground ${className}`} style={{ height }}>
        Location unavailable
      </div>
    );
  }
  return <div ref={mapRef} className={className} style={{ height }} />;
};

export default LiveMap;
