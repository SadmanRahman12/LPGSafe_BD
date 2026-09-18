"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, QrCode as QrIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeCardProps {
  value: string;
  title?: string;
  subtext?: string;
  size?: number;
  showDownload?: boolean;
}

export default function QRCodeCard({
  value,
  title,
  subtext,
  size = 200,
  showDownload = true,
}: QRCodeCardProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 2,
      color: {
        dark: "#061021",
        light: "#ffffff",
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error("Error generating QR:", err));
  }, [value, size]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>LPGSafe BD - Cylinder QR Code</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            .card { border: 2px solid #000; padding: 24px; display: inline-block; border-radius: 12px; }
            img { width: 220px; height: 220px; }
            h2 { margin: 8px 0 4px; font-size: 18px; }
            p { margin: 0; color: #555; font-size: 12px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="${dataUrl}" />
            <h2>${title || "LPGSafe Bangladesh Verified"}</h2>
            <p>${value}</p>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `LPGSafe-QR-${value.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
      {dataUrl ? (
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <img
            src={dataUrl}
            alt={value}
            width={size}
            height={size}
            className="rounded-lg object-contain mx-auto"
          />
        </div>
      ) : (
        <div
          style={{ width: size, height: size }}
          className="rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"
        >
          <QrIcon className="w-12 h-12 animate-pulse" />
        </div>
      )}

      {title && <h3 className="font-bold text-sm text-navy-950">{title}</h3>}
      {subtext && <p className="text-xs font-mono text-slate-500 max-w-xs">{subtext}</p>}

      {showDownload && (
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Badge
          </Button>
        </div>
      )}
    </div>
  );
}
