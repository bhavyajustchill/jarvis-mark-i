"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { RotateCcw, ShieldAlert, ZoomIn, ZoomOut } from "lucide-react";
import { HoloScene } from "@/components/Canvas3D/HoloScene";
import { useJarvisStore } from "@/lib/store";

/** Keeps a WebGL failure inside the panel instead of taking the dashboard down. */
class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("[HoloDisplay] 3D scene failed:", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-xs font-mono">
          <ShieldAlert className="w-10 h-10 text-[#00E5B0] mb-2" />
          <p className="text-[#00E5B0] font-bold">3D DISPLAY UNAVAILABLE</p>
          <p className="text-[#7A8A99] mt-1">Please make sure WebGL2 is enabled in your browser settings.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const chipButton =
  "flex items-center justify-center w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.55)] text-[#7A8A99] hover:text-[#00E5B0] hover:border-[rgba(0,229,176,0.5)] transition-colors cursor-pointer";

/**
 * HOLOGRAPHIC DISPLAY panel: the particle sphere scene (after my-jarvis), reacting to the voice link,
 * with zoom / reset chips. Keys: + / - zoom, R resets; drag to rotate, scroll to zoom.
 */
function HoloDisplayComponent({ pcmPlayer, getInputByteFrequencyData, compact = false }) {
  const apiRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Voice energy: Jarvis's playback level and the operator's microphone, whichever is louder
  const getAudioEnergy = useCallback(() => {
    let energy = 0;
    if (pcmPlayer) {
      const level = typeof pcmPlayer.getInstantEnergy === "function" ? pcmPlayer.getInstantEnergy() : typeof pcmPlayer.getEnergy === "function" ? pcmPlayer.getEnergy() : 0;
      energy = Math.max(energy, level || 0);
    }
    if (typeof getInputByteFrequencyData === "function") {
      const data = getInputByteFrequencyData();
      if (data && data.length > 0) {
        let sum = 0;
        const n = Math.min(32, data.length);
        for (let i = 0; i < n; i++) sum += data[i];
        energy = Math.max(energy, (sum / (n * 255)) * 1.5);
      }
    }
    return energy;
  }, [pcmPlayer, getInputByteFrequencyData]);

  const getStatus = useCallback(() => useJarvisStore.getState().status, []);

  // Zoom / reset requests from anywhere on the HUD
  useEffect(() => {
    const onCameraAction = (e) => {
      const api = apiRef.current;
      if (!api) return;
      if (e.detail === "in") api.zoomIn();
      else if (e.detail === "out") api.zoomOut();
      else if (e.detail === "reset") api.resetView();
    };
    window.addEventListener("jarvis-camera-action", onCameraAction);
    return () => window.removeEventListener("jarvis-camera-action", onCameraAction);
  }, []);

  // Keys: + / - zoom, R reset (ignored while typing)
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      if (e.key === "+" || e.key === "=") apiRef.current?.zoomIn();
      else if (e.key === "-" || e.key === "_") apiRef.current?.zoomOut();
      else if (e.key === "r" || e.key === "R") apiRef.current?.resetView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-black border border-[rgba(255,255,255,0.05)]">
      <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
        {mounted ? (
          <SceneErrorBoundary>
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: "high-performance" }}>
              <Suspense fallback={null}>
                <HoloScene apiRef={apiRef} getStatus={getStatus} getAudioEnergy={getAudioEnergy} particleCount={compact ? 6000 : 10000} />
              </Suspense>
            </Canvas>
          </SceneErrorBoundary>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] tracking-[3px] text-[#00E5B0]/70 font-[family-name:var(--font-orbitron)]">CALIBRATING DISPLAY...</div>
        )}
      </div>

      {/* Camera chips */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button type="button" className={chipButton} onClick={() => apiRef.current?.zoomIn()} title="Zoom In (+)" aria-label="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button type="button" className={chipButton} onClick={() => apiRef.current?.zoomOut()} title="Zoom Out (-)" aria-label="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button type="button" className={chipButton} onClick={() => apiRef.current?.resetView()} title="Reset View (R)" aria-label="Reset view">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 px-3 py-1.5 rounded-lg bg-[rgba(0,0,0,0.6)] text-[10px] tracking-[2px] text-[#00E5B0] font-[family-name:var(--font-orbitron)] pointer-events-none">
        HOLOGRAPHIC DISPLAY
      </div>
    </div>
  );
}

export const HoloDisplay = React.memo(HoloDisplayComponent);
export default HoloDisplay;
