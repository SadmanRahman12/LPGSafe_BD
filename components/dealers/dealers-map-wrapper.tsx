"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const DealersMapDynamic = dynamic(
  () => import("@/components/dealers/dealers-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
        <MapPin className="w-8 h-8 animate-bounce text-slate-400" />
        <span className="text-xs font-semibold">Loading Bangladesh interactive dealer map...</span>
      </div>
    ),
  }
);

export default function DealersMapWrapper(props: any) {
  return <DealersMapDynamic {...props} />;
}
