"use client";

import dynamic from "next/dynamic";
import { MapMarkerItem } from "./bangladesh-risk-map";

const BangladeshRiskMap = dynamic(() => import("./bangladesh-risk-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center border border-slate-200 text-slate-400 gap-2">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
      <span className="text-xs font-semibold">Initializing Bangladesh Risk Geo-Grid...</span>
    </div>
  ),
});

interface Props {
  markers: MapMarkerItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarkerItem) => void;
}

export default function BangladeshRiskMapWrapper(props: Props) {
  return <BangladeshRiskMap {...props} />;
}
