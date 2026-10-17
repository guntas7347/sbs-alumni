"use client";

import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  className?: string;
}

export default function Barcode({
  value,
  format = "CODE128",
  width = 1.8,
  height = 46,
  fontSize = 11,
  className = "",
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          lineColor: "#18181b",
          width,
          height,
          displayValue: true,
          font: "monospace",
          fontSize,
          textMargin: 3,
          margin: 4,
          background: "transparent",
        });
      } catch (err) {
        console.error("Barcode generation error:", err);
      }
    }
  }, [value, format, width, height, fontSize]);

  return <svg ref={svgRef} className={`max-w-full ${className}`} />;
}
