"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Send, Square } from "lucide-react";
import { useJarvisStore } from "@/lib/store";
import { MarkdownText } from "@/components/HUD/MarkdownText";


function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Sir.";
  if (hour < 18) return "Good afternoon, Sir.";
  return "Good evening, Sir.";
}

/** Mic button look per link state (my-jarvis: teal idle, red while listening, red Stop while speaking). */
function micLook({ isConnected, isMuted, status }) {
  if (status === "SPEAKING") {
    return {
      Icon: Square,
      className: "bg-[linear-gradient(135deg,#FF4444,#CC0000)] text-white shadow-[0_0_20px_rgba(255,68,68,0.5)]",
      title: "Stop Jarvis speaking (interrupt)",
      fill: true,
    };
  }
  if (!isConnected) {
    return { Icon: MicOff, className: "bg-[rgba(0,229,176,0.2)] text-[#00E5B0] hover:bg-[rgba(0,229,176,0.3)]", title: "Connect the voice link" };
  }
  if (isMuted) {
    return { Icon: MicOff, className: "bg-[rgba(0,229,176,0.2)] text-[#00E5B0] hover:bg-[rgba(0,229,176,0.3)]", title: "Unmute microphone" };
  }
  return {
    Icon: Mic,
    className: "bg-[linear-gradient(135deg,#FF4444,#CC0000)] text-white shadow-[0_0_20px_rgba(255,68,68,0.45)]",
    title: "Mute microphone",
  };
}

/**
 * NEURAL LINK (after my-jarvis's chat card): the conversation as bubbles (operator teal, Jarvis
 * glass, system actions as small grey lines), a typing indicator while Jarvis thinks, and the input row:
 * mic button (connect / mute / unmute, or Stop to interrupt while he speaks), text box, and send.
 */
export function NeuralLink({ isConnected, onSend, onMic }) {
  const commsLog = useJarvisStore((s) => s.commsLog);
  const status = useJarvisStore((s) => s.status);
  const isMuted = useJarvisStore((s) => s.isMuted);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  const hasConversation = useMemo(() => commsLog.some((m) => m.sender === "user" || m.sender === "jarvis"), [commsLog]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [commsLog, status]);

  const submit = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const mic = micLook({ isConnected, isMuted, status });
  const speaking = status === "SPEAKING";

  return (
    <section className="flex-1 min-h-[170px] flex flex-col rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] overflow-hidden" aria-label="Neural Link">
      <header className="flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-[rgba(255,255,255,0.05)] shrink-0">
        <span
          className={`w-2 h-2 rounded-full transition-all ${isConnected ? "bg-[#00E5B0] shadow-[0_0_10px_#00E5B0]" : "bg-[#333]"}`}
          aria-hidden="true"
        />
        <h2 className="m-0 text-[14px] font-bold tracking-[2px] text-[#00E5B0] font-[family-name:var(--font-orbitron)]">NEURAL LINK</h2>
      </header>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-3">
        {!hasConversation && (
          // On phones the greeting is one line, so the system lines below it stay in view
          <div className="flex-1 min-h-[96px] flex flex-col items-center justify-center text-center gap-2 py-4 max-sm:flex-none max-sm:min-h-0 max-sm:flex-row max-sm:py-1">
            <Mic className="w-8 h-8 max-sm:w-5 max-sm:h-5 text-[#00E5B0]/70" />
            <p className="m-0 text-[15px] max-sm:text-[14px] text-[#888]">{greeting()}</p>
            <p className="m-0 text-[12px] text-[#555] max-sm:hidden">Click the microphone or type a command...</p>
          </div>
        )}

        {commsLog.map((item) => {
          if (item.sender === "user") {
            return (
              <div key={item.id} className="self-end max-w-[85%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed text-white bg-[linear-gradient(135deg,rgba(0,180,140,0.6),rgba(0,120,100,0.6))] break-words select-text" title={item.time}>
                {item.text}
              </div>
            );
          }
          if (item.sender === "jarvis") {
            return (
              <div key={item.id} className="self-start max-w-[85%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed text-[#E6F1FF] bg-[rgba(255,255,255,0.05)] break-words select-text" title={item.time}>
                <MarkdownText content={item.text} />
              </div>
            );
          }
          return (
            <div key={item.id} className="self-stretch text-[11px] font-mono leading-snug text-[#7A8A99] break-words select-text px-1" title={item.time}>
              <span className="text-[#00AA77] mr-1.5">›</span>
              {item.text}
            </div>
          );
        })}

        {status === "THINKING" && (
          <div className="self-start flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-[rgba(255,255,255,0.05)]" aria-label="Jarvis is thinking">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-[#00E5B0] [animation:jarvisDotBounce_0.6s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 border-t border-[rgba(255,255,255,0.05)] shrink-0">
        <button
          type="button"
          onClick={onMic}
          className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${mic.className}`}
          title={mic.title}
          aria-label={mic.title}>
          <mic.Icon className={`w-5 h-5 ${mic.fill ? "fill-current" : ""}`} />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={speaking ? "Jarvis is speaking... click ■ to stop" : "Speak or type a command..."}
          aria-label="Command"
          className="flex-1 min-w-0 h-11 sm:h-12 px-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[14px] text-white placeholder:text-[#666] outline-none focus:border-[rgba(0,229,176,0.5)] transition-colors select-text"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="shrink-0 w-11 h-11 sm:w-13 sm:h-12 rounded-xl flex items-center justify-center bg-[linear-gradient(135deg,#00E5B0,#00AA77)] text-black disabled:opacity-40 transition-all cursor-pointer"
          title="Send [Enter]"
          aria-label="Send">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </section>
  );
}

export default NeuralLink;
