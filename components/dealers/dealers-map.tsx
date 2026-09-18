"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import Link from "next/link";

interface DealerMapItem {
  id: string;
  businessName: string;
  division: string;
  district: string;
  address: string;
  phone: string;
  latitude?: number | null;
  longitude?: number | null;
  isCertified: boolean;
  currentLpgPrice: number;
  rating: number;
}

interface DealersMapProps {
  dealers: DealerMapItem[];
  selectedDealerId?: string | null;
  onSelectDealer?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function DealersMap({
  dealers,
  selectedDealerId,
  onSelectDealer,
  center = [23.685, 90.3563], // Bangladesh center
  zoom = 7,
  height = "420px",
}: DealersMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | LPGSafe BD',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const validDealers = dealers.filter(
      (d) => d.latitude != null && d.longitude != null && !isNaN(d.latitude) && !isNaN(d.longitude)
    );

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    validDealers.forEach((d) => {
      const lat = d.latitude!;
      const lng = d.longitude!;
      bounds.extend([lat, lng]);

      const isCertified = d.isCertified;
      const markerColor = isCertified ? "#059669" : "#d97706";
      const borderColor = isCertified ? "#047857" : "#b45309";

      // Rich SVG divIcon (avoids Next.js Leaflet PNG asset 404s)
      const customIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${markerColor};
            border: 2.5px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            <span style="
              transform: rotate(45deg);
              color: #ffffff;
              font-size: 11px;
              font-weight: 800;
              font-family: sans-serif;
            ">LPG</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 200px; padding: 2px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${
            isCertified ? "#059669" : "#d97706"
          }; letter-spacing: 0.5px;">
            ${isCertified ? "✓ Certified Retailer" : "⚠ Pending Inspection"}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #061021; margin: 3px 0 2px 0;">
            ${d.businessName}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            ${d.address}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 6px; margin-top: 6px;">
            <div>
              <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; display: block; font-weight: 700;">12kg LPG</span>
              <strong style="font-size: 13px; color: #0f172a;">৳${d.currentLpgPrice?.toLocaleString()}</strong>
            </div>
            <a href="/dealers/${d.id}" style="
              background: #061021;
              color: #ffffff;
              text-decoration: none;
              font-size: 11px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 6px;
              display: inline-block;
            ">View Outlet</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        if (onSelectDealer) onSelectDealer(d.id);
      });

      markersRef.current.push(marker);
    });

    if (validDealers.length > 0 && mapInstanceRef.current) {
      if (validDealers.length === 1) {
        mapInstanceRef.current.setView([validDealers[0].latitude!, validDealers[0].longitude!], 13);
      } else {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }

    return () => {
      // Keep map alive across standard renders, will unmount on unmount
    };
  }, [dealers]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 z-0">
      <div ref={mapContainerRef} style={{ height, width: "100%" }} />
      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs text-slate-700 flex items-center gap-4 z-[1000] pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block border border-white" />
          <span className="font-semibold text-slate-800">Certified Dealer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-white" />
          <span className="font-semibold text-slate-800">Pending Review</span>
        </div>
      </div>
    </div>
  );
}
