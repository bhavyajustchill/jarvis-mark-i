"use client";

import React, { useEffect } from "react";
import { Cpu, MemoryStick, Network } from "lucide-react";
import { useJarvisStore } from "@/lib/store";

const pct = (value) => `${Math.round(Number(value) || 0)}%`;

function Tile({ Icon, color, value, label, detail }) {
  return (
    <div className="min-w-0 flex flex-col items-center justify-center text-center rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-2 py-3 sm:py-4 max-sm:[@media(max-height:700px)]:py-2">
      <Icon className="w-4 h-4" style={{ color }} />
      <div className="mt-1.5 text-[clamp(16px,2.4vw,24px)] font-bold text-white leading-none tabular-nums font-[family-name:var(--font-orbitron)] truncate max-w-full">{value}</div>
      <div className="mt-1 text-[10px] tracking-[1px] text-[#666]">{label}</div>
      {detail && <div className="mt-0.5 text-[9px] tracking-[0.5px] text-[#4d5a66] truncate max-w-full max-sm:[@media(max-height:700px)]:hidden">{detail}</div>}
    </div>
  );
}

/**
 * Metric tiles (after my-jarvis's CPU / MEMORY / DISK row): CPU (with the GPU reading),
 * MEMORY (used of total), and NETWORK (with uptime, processes, and OS). Polls /api/system-telemetry
 * every 2.5 s, as the old Systems panel did.
 */
export function MetricsTiles() {
  const telemetry = useJarvisStore((s) => s.systemTelemetry);
  const setSystemTelemetry = useJarvisStore((s) => s.setSystemTelemetry);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/system-telemetry");
        if (res.ok && alive) setSystemTelemetry(await res.json());
      } catch (err) {
        console.warn("[MetricsTiles] Telemetry poll failed:", err);
      }
    };
    poll();
    const timer = setInterval(poll, 2500);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [setSystemTelemetry]);

  const t = telemetry || {};
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0" aria-label="System metrics">
      <Tile Icon={Cpu} color="#00E5B0" value={pct(t.cpu)} label="CPU" detail={t.gpu != null ? `GPU ${pct(t.gpu)}` : null} />
      <Tile Icon={MemoryStick} color="#AA66FF" value={pct(t.mem)} label="MEMORY" detail={t.memUsedGb || t.memUsed ? `${t.memUsedGb || t.memUsed} / ${t.memTotalGb || t.memTotal}` : null} />
      <Tile Icon={Network} color="#FFAA00" value={t.net || "0KB/s"} label="NETWORK" detail={[t.uptime && `UP ${t.uptime}`, t.proc && `${t.proc} PROC`, t.os].filter(Boolean).join(" · ")} />
    </div>
  );
}

export default MetricsTiles;
