"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

export interface MapMarkerItem {
  id: string;
  title: string;
  subtitle?: string;
  division?: string;
  district?: string;
  latitude: number;
  longitude: number;
  status: "SAFE" | "WARNING" | "DANGER" | "INFO";
  typeLabel?: string;
  metricLabel?: string;
  metricValue?: string;
  linkUrl?: string;
}

interface BangladeshRiskMapProps {
  markers: MapMarkerItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarkerItem) => void;
}

export default function BangladeshRiskMap({
  markers,
  center = [23.685, 90.3563],
  zoom = 7,
  height = "420px",
  onMarkerClick,
}: BangladeshRiskMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | LPGSafe BD National Risk Engine',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear previous markers
    markersGroupRef.current.forEach((m) => m.remove());
    markersGroupRef.current = [];

    const validMarkers = markers.filter(
      (m) => m.latitude != null && m.longitude != null && !isNaN(m.latitude) && !isNaN(m.longitude)
    );

    const bounds = L.latLngBounds([]);

    validMarkers.forEach((item) => {
      bounds.extend([item.latitude, item.longitude]);

      let color = "#059669"; // Green = Safe
      let label = "PASS";
      if (item.status === "WARNING") {
        color = "#d97706"; // Orange = Pending
        label = "PEND";
      } else if (item.status === "DANGER") {
        color = "#dc2626"; // Red = High Risk
        label = "RISK";
      } else if (item.status === "INFO") {
        color = "#2563eb"; // Blue = Depot
        label = "DEPOT";
      }

      const icon = L.divIcon({
        className: "custom-risk-pin",
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${color};
            border: 2px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            <span style="
              transform: rotate(45deg);
              color: #ffffff;
              font-size: 8px;
              font-weight: 900;
              font-family: sans-serif;
              letter-spacing: -0.5px;
            ">${label}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const leafletMarker = L.marker([item.latitude, item.longitude], { icon }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 180px; padding: 3px;">
          <div style="font-size: 10px; font-weight: 800; color: ${color}; text-transform: uppercase; letter-spacing: 0.5px;">
            ${item.typeLabel || item.status}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #061021; margin: 3px 0 2px;">
            ${item.title}
          </div>
          ${item.subtitle ? `<div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${item.subtitle}</div>` : ""}
          ${
            item.metricValue
              ? `<div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 4px; border-top: 1px solid #f1f5f9; padding-top: 4px;">
                  ${item.metricLabel || "Metric"}: <span>${item.metricValue}</span>
                </div>`
              : ""
          }
          ${
            item.linkUrl
              ? `<a href="${item.linkUrl}" style="display: inline-block; margin-top: 6px; font-size: 10px; font-weight: 700; color: #ffffff; background: #061021; padding: 4px 8px; border-radius: 6px; text-decoration: none;">View File &rarr;</a>`
              : ""
          }
        </div>
      `;

      leafletMarker.bindPopup(popupHtml);

      if (onMarkerClick) {
        leafletMarker.on("click", () => onMarkerClick(item));
      }

      markersGroupRef.current.push(leafletMarker);
    });

    if (validMarkers.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [markers, center, zoom, onMarkerClick]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0"
    />
  );
}
