"use client";

import React, { useCallback, useState } from "react";
import {
  Brain,
  Globe,
  Key,
  Maximize2,
  Minimize2,
  Settings,
  SunMedium,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useJarvisStore } from "@/lib/store";
import { useGeminiLive } from "@/hooks/useGeminiLive";
import { LandingPage } from "@/components/Landing/LandingPage";
import { HoloDisplay } from "@/components/Canvas3D/HoloDisplay";
import { NeuralLink } from "@/components/HUD/NeuralLink";
import { MetricsTiles } from "@/components/HUD/MetricsTiles";
import { ApiKeyModal } from "@/components/HUD/ApiKeyModal";
import { SciFiMemoryModal } from "@/components/HUD/SciFiMemoryModal";
import { SciFiSettingsModal } from "@/components/HUD/SciFiSettingsModal";
import { SciFiMemoryVaultModal } from "@/components/HUD/SciFiMemoryVaultModal";
import { IntelModal } from "@/components/HUD/IntelModal";

// Header state pill (my-jarvis): red while listening, amber while processing, teal while speaking
const STATE_PILLS = {
  LISTENING: { text: "LISTENING...", className: "bg-[rgba(255,68,68,0.3)] text-[#FF4444] border-[#FF4444]" },
  THINKING: { text: "PROCESSING...", className: "bg-[rgba(255,170,0,0.3)] text-[#FFAA00] border-[#FFAA00]" },
  SPEAKING: { text: "SPEAKING...", className: "bg-[rgba(0,229,176,0.3)] text-[#00E5B0] border-[#00E5B0]" },
};

const toolButton = (active) =>
  `relative flex items-center justify-center h-9 lg:w-9 max-sm:[@media(max-height:640px)]:h-8 rounded-lg transition-all cursor-pointer ${active
    ? "bg-[rgba(0,229,176,0.35)] text-[#00FFD4] shadow-[0_0_12px_rgba(0,229,176,0.35)]"
    : "bg-[rgba(0,229,176,0.15)] text-[#00E5B0] hover:bg-[rgba(0,229,176,0.28)]"
  }`;

export default function Home() {
  const {
    status,
    isMuted,
    toggleMute,
    latencyMs,
    isKeyModalOpen,
    setIsKeyModalOpen,
    isMemoryVaultOpen,
    setIsMemoryVaultOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    loadStoredApiKey,
    loadStoredMicMuted,
    loadMemories,
    addCommsMessage,
    isIntelOpen,
    setIsIntelOpen,
    intelSearchResults,
  } = useJarvisStore();

  // The landing page shows first; INITIALIZE enters the dashboard and starts the voice link
  const [entered, setEntered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // iPhone Safari has no page fullscreen, so its button is hidden there
  const [canFullscreen, setCanFullscreen] = useState(true);

  // Sync fullscreen state with document fullscreenchange
  React.useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => console.warn("[Fullscreen] Failed to enter fullscreen:", err));
    } else {
      document.exitFullscreen?.().catch((err) => console.warn("[Fullscreen] Failed to exit fullscreen:", err));
    }
  };

  // Load API key, mic mute preference, voice, and memory vault from storage upon client mount
  React.useEffect(() => {
    loadStoredApiKey();
    loadStoredMicMuted();
    loadMemories();
    useJarvisStore.getState().loadStoredVoiceName?.();
  }, [loadStoredApiKey, loadStoredMicMuted, loadMemories]);

  const {
    connectSession,
    disconnectSession,
    handleBargeIn,
    pcmPlayer,
    getInputByteFrequencyData,
    sendTextMessage,
    triggerBriefing,
  } = useGeminiLive();

  // Global user interaction unlock for browser AudioContext autoplay policy
  React.useEffect(() => {
    const unlockAudio = () => pcmPlayer?.initContext();
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [pcmPlayer]);

  const isConnected = status !== "DISCONNECTED" && status !== "CONNECTING";

  const connect = useCallback(() => {
    const activeKey = useJarvisStore.getState().userApiKey || loadStoredApiKey();
    connectSession(activeKey || "");
  }, [connectSession, loadStoredApiKey]);

  // INITIALIZE: unlock audio inside the click, enter the dashboard, and link up
  const handleEnter = useCallback(() => {
    pcmPlayer?.initContext();
    setEntered(true);
    connect();
  }, [pcmPlayer, connect]);

  const handleToggleConnection = () => {
    if (isConnected || status === "CONNECTING") disconnectSession();
    else connect();
  };

  const handleSendText = (text) => {
    if (!isConnected && status !== "CONNECTING") connect();
    addCommsMessage("user", text);
    sendTextMessage(text);
  };

  // Mic button: connect when offline, Stop (barge-in) while Jarvis speaks, otherwise mute / unmute
  const handleMic = () => {
    if (status === "SPEAKING") handleBargeIn();
    else if (!isConnected && status !== "CONNECTING") connect();
    else if (isConnected) toggleMute();
  };

  const statePill = STATE_PILLS[status];
  const subtitle =
    status === "CONNECTING" ? "LINKING VOICE CORE..." : isConnected ? (isMuted ? "VOICE ASSISTANT // MIC MUTED" : "VOICE ASSISTANT ACTIVE") : "VOICE ASSISTANT STANDBY";

  const tools = [
    { key: "briefing", Icon: SunMedium, title: "Daily / Tactical Briefing", active: false, onClick: triggerBriefing },
    {
      key: "intel",
      Icon: Globe,
      title: "Neural Intel & Dossiers",
      active: isIntelOpen,
      badge: intelSearchResults?.length || 0,
      onClick: () => (isIntelOpen ? window.dispatchEvent(new CustomEvent("jarvis-close-intel")) : setIsIntelOpen(true)),
    },
    { key: "memories", Icon: Brain, title: "Memory Vault", active: isMemoryVaultOpen, onClick: () => setIsMemoryVaultOpen(true) },
    { key: "settings", Icon: Settings, title: "Settings", active: isSettingsModalOpen, onClick: () => setIsSettingsModalOpen(true) },
    { key: "key", Icon: Key, title: "Gemini API Key", active: isKeyModalOpen, onClick: () => setIsKeyModalOpen(true) },
    ...(canFullscreen
      ? [{ key: "fullscreen", Icon: isFullscreen ? Minimize2 : Maximize2, title: isFullscreen ? "Exit Fullscreen" : "Fullscreen", active: isFullscreen, onClick: toggleFullscreen }]
      : []),
  ];

  return (
    <main className="relative w-screen h-dvh bg-[#000814] text-white overflow-hidden flex flex-col font-[family-name:var(--font-rajdhani)] select-none">
      {!entered && <LandingPage onEnter={handleEnter} />}

      {entered && (
        <>
          {/* HEADER (my-jarvis): logo orb and title, state pill, link pill, tool buttons. Below 1024px the
              tools get a row of their own. */}
          <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 px-5 py-3 max-sm:px-4 max-sm:pt-[calc(env(safe-area-inset-top)+10px)] bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)] shrink-0 [animation:scifiModalUnfoldDown_0.4s_ease-out_both]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-10 h-10 max-sm:w-9 max-sm:h-9 rounded-full bg-[linear-gradient(135deg,#00E5B0,#00AA77)] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,176,0.5)]">
                <div className={`w-5 h-5 max-sm:w-4 max-sm:h-4 rounded-full bg-[#00FFD4] shadow-[0_0_15px_rgba(0,255,212,0.8)] ${status === "SPEAKING" ? "animate-pulse" : ""}`} />
              </div>
              <div className="min-w-0">
                <h1 className="m-0 text-[20px] max-sm:text-[16px] font-bold tracking-[4px] max-sm:tracking-[3px] text-[#00E5B0] font-[family-name:var(--font-orbitron)] whitespace-nowrap">J.A.R.V.I.S.</h1>
                <p className="m-0 text-[10px] max-sm:text-[9px] tracking-[2px] text-[#00AA77] whitespace-nowrap truncate">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 max-sm:gap-2 ml-auto">
              {statePill && (
                <div className={`max-sm:hidden flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] border ${statePill.className}`}>
                  <span className="w-2 h-2 rounded-full bg-current [animation:jarvisPulseDot_1s_ease-in-out_infinite]" />
                  {statePill.text}
                </div>
              )}
              <button
                type="button"
                onClick={handleToggleConnection}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border cursor-pointer transition-colors ${status === "CONNECTING"
                  ? "bg-[rgba(255,170,0,0.2)] text-[#FFAA00] border-[rgba(255,170,0,0.35)]"
                  : isConnected
                    ? "bg-[rgba(0,200,100,0.2)] text-[#00dd66] border-[rgba(0,200,100,0.3)] hover:bg-[rgba(0,200,100,0.3)]"
                    : "bg-[rgba(255,50,50,0.2)] text-[#ff4444] border-[rgba(255,50,50,0.3)] hover:bg-[rgba(255,50,50,0.3)]"
                  }`}
                title={isConnected || status === "CONNECTING" ? "Disconnect the voice link" : "Connect the voice link"}>
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {status === "CONNECTING" ? "LINKING" : isConnected ? "ONLINE" : "OFFLINE"}
                {isConnected && latencyMs > 0 && <span className="max-sm:hidden opacity-75">· {latencyMs}ms</span>}
              </button>
            </div>

            <nav className="flex items-center gap-2 max-lg:order-last max-lg:w-full max-lg:grid max-lg:grid-cols-6 max-sm:gap-1.5" aria-label="Tools">
              {tools.map(({ key, Icon, title, active, onClick, badge }) => (
                <button key={key} type="button" onClick={onClick} className={toolButton(active)} title={title} aria-label={title}>
                  <Icon className="w-[18px] h-[18px]" />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#00E5B0] text-black text-[9px] font-bold leading-4 text-center">{badge}</span>
                  )}
                </button>
              ))}
            </nav>
          </header>

          {/* BODY (my-jarvis): HOLOGRAPHIC DISPLAY (60%) beside NEURAL LINK and the metric tiles (40%);
              stacked below 1024px */}
          <div className="flex-1 min-h-0 flex gap-4 p-4 max-lg:flex-col max-sm:gap-3 max-sm:p-3 max-sm:pb-[calc(env(safe-area-inset-bottom)+12px)] [animation:jarvisFadeUp_0.5s_ease-out_both]">
            <div className="lg:flex-[3] min-w-0 min-h-0 max-lg:h-[40dvh] max-sm:h-[min(28dvh,260px)] max-sm:[@media(max-height:640px)]:h-[22dvh] max-lg:shrink-0">
              <HoloDisplay pcmPlayer={pcmPlayer} getInputByteFrequencyData={getInputByteFrequencyData} />
            </div>
            <div className="lg:flex-[2] min-w-0 min-h-0 flex-1 flex flex-col gap-4 max-sm:gap-3">
              <NeuralLink isConnected={isConnected} onSend={handleSendText} onMic={handleMic} />
              <MetricsTiles />
            </div>
          </div>
        </>
      )}



      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onSaveKey={(key) => {
          if (status === "DISCONNECTED") connectSession(key);
        }}
      />

      {/* Memory card and Memory Vault */}
      <SciFiMemoryModal />
      <SciFiMemoryVaultModal />

      {/* Settings */}
      <SciFiSettingsModal onReconnectSession={connectSession} />

      {/* Draggable Neural Intel window */}
      <IntelModal />
    </main>
  );
}
