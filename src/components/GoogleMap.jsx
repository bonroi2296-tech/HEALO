"use client";

// src/components/GoogleMap.jsx
import React, { useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '200px',
};

// 서울 기본 좌표 (강남구)
const defaultCenter = {
  lat: 37.4979,
  lng: 127.0276,
};

// 위치 문자열을 간단히 파싱 (예: "Gangnam, Seoul" -> 강남구 좌표)
const parseLocation = (location) => {
  if (!location) return defaultCenter;
  
  const lower = location.toLowerCase();
  // 간단한 위치 매핑 (추후 Geocoding API로 개선 가능)
  if (lower.includes('gangnam') || lower.includes('강남')) {
    return { lat: 37.4979, lng: 127.0276 };
  }
  if (lower.includes('sinsa') || lower.includes('신사')) {
    return { lat: 37.5161, lng: 127.0193 };
  }
  if (lower.includes('seoul') || lower.includes('서울')) {
    return { lat: 37.5665, lng: 126.9780 }; // 서울시청
  }
  
  return defaultCenter;
};

export const GoogleMapComponent = ({ location, hospitalName, latitude, longitude }) => {
  const apiKey =
    (typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ||
    (typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      : undefined);

  // 좌표가 있으면 우선 사용, 없으면 주소 파싱
  const center = useMemo(() => {
    if (latitude && longitude) {
      return { lat: Number(latitude), lng: Number(longitude) };
    }
    return parseLocation(location);
  }, [location, latitude, longitude]);

  // ✅ useLoadScript 훅 사용 (중복 로드 방지)
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    // 중복 로드 방지를 위한 옵션
    preventGoogleFontsLoading: true,
  });

  // API 키가 없으면 placeholder 표시
  if (!apiKey) {
    return (
      <div className="bg-gray-100 w-full h-full min-h-[200px] flex items-center justify-center text-gray-400 font-bold">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs">Google Maps API key required</span>
          <span className="text-[10px] text-gray-300">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or VITE_GOOGLE_MAPS_API_KEY) to
            .env
          </span>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-teal-600" />
          <span className="text-xs text-gray-500">Loading map...</span>
        </div>
      </div>
    );
  }

  // 로드 에러
  if (loadError) {
    return (
      <div className="bg-gray-100 w-full h-full min-h-[200px] flex items-center justify-center text-gray-400 font-bold">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs">Failed to load Google Maps</span>
          <span className="text-[10px] text-gray-300">
            {loadError.message || 'Please check your API key'}
          </span>
        </div>
      </div>
    );
  }

  // 지도 렌더링
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      }}
    >
      <Marker
        position={center}
        title={hospitalName || 'Hospital Location'}
        icon={{
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        }}
      />
    </GoogleMap>
  );
};
