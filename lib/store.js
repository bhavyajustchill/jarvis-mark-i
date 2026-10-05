import { create } from 'zustand';

/**
 * Global Zustand store for J.A.R.V.I.S. Mark I: link status, the conversation log, live telemetry,
 * the memory vault and operator profile, panel visibility, and the user's API key.
 */

const STORAGE = {
  apiKey: 'jarvis_mark_i_api_key',
  micMuted: 'jarvis_mark_i_mic_muted',
  voiceName: 'jarvis_mark_i_voice_name',
};

// Key names used by earlier builds, moved to the current names the first time they are read
const LEGACY_STORAGE = {
  apiKey: 'ada_gemini_api_key',
  micMuted: 'ada_mic_muted',
};

function readStorage(name) {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(STORAGE[name]);
    if (value !== null) return value;
    const legacy = LEGACY_STORAGE[name] && localStorage.getItem(LEGACY_STORAGE[name]);
    if (legacy !== null && legacy !== undefined) {
      localStorage.setItem(STORAGE[name], legacy);
      localStorage.removeItem(LEGACY_STORAGE[name]);
      return legacy;
    }
  } catch (e) {
    console.warn(`[useJarvisStore] Could not read ${name} from localStorage:`, e);
  }
  return null;
}

function writeStorage(name, value) {
  if (typeof window === 'undefined') return;
  try {
    if (value === null || value === '') localStorage.removeItem(STORAGE[name]);
    else localStorage.setItem(STORAGE[name], String(value));
  } catch (e) {
    console.warn(`[useJarvisStore] Could not save ${name} to localStorage:`, e);
  }
}

// Muting switches the live status between LISTENING and CONNECTED (never while offline)
function mutedStatus(status, isMuted) {
  if (isMuted && status === 'LISTENING') return 'CONNECTED';
  if (!isMuted && status === 'CONNECTED') return 'LISTENING';
  return status;
}

export const useJarvisStore = create((set, get) => ({
  // Live session status
  status: 'DISCONNECTED', // DISCONNECTED | CONNECTING | CONNECTED | LISTENING | THINKING | SPEAKING
  setStatus: (status) => set({ status }),
  latencyMs: 0,
  setLatencyMs: (latencyMs) => set({ latencyMs }),

  // Microphone mute (remembered in the browser)
  isMuted: false,
  setIsMuted: (isMuted) => {
    writeStorage('micMuted', isMuted);
    set((state) => ({ isMuted, status: mutedStatus(state.status, isMuted) }));
  },
  toggleMute: () => get().setIsMuted(!get().isMuted),
  loadStoredMicMuted: () => {
    const stored = readStorage('micMuted');
    if (stored === null) return false;
    const isMuted = stored === 'true';
    set((state) => ({ isMuted, status: mutedStatus(state.status, isMuted) }));
    return isMuted;
  },

  // Voice (remembered in the browser) and the session reconnect hook used after a voice change
  reconnectSession: null,
  setReconnectSession: (reconnectSession) => set({ reconnectSession }),
  loadStoredVoiceName: () => {
    const stored = readStorage('voiceName');
    if (stored) {
      set((state) => ({ operatorProfile: { ...state.operatorProfile, voiceName: stored } }));
      return stored;
    }
    return 'Charon';
  },

  // Panels and modals
  isKeyModalOpen: false,
  setIsKeyModalOpen: (isKeyModalOpen) => set({ isKeyModalOpen }),
  isSettingsModalOpen: false,
  setIsSettingsModalOpen: (isSettingsModalOpen) => set({ isSettingsModalOpen }),
  isMemoryVaultOpen: false,
  setIsMemoryVaultOpen: (isMemoryVaultOpen) => set({ isMemoryVaultOpen }),
  isIntelOpen: false,
  setIsIntelOpen: (isIntelOpen) => set({ isIntelOpen }),

  // Live host telemetry (polled from /api/system-telemetry)
  systemTelemetry: {
    cpu: 0,
    mem: 0,
    memUsed: '',
    memTotal: '',
    memUsedGb: '',
    memTotalGb: '',
    net: '0KB/s',
    gpu: 0,
    uptime: '',
    proc: 0,
    os: '',
    platform: '',
    lastUpdated: null,
  },
  setSystemTelemetry: (telemetry) =>
    set((state) => ({
      systemTelemetry: {
        ...state.systemTelemetry,
        ...telemetry,
        lastUpdated: new Date().toLocaleTimeString(),
      },
    })),

  // Conversation log (operator, Jarvis, and system lines)
  commsLog: [
    {
      id: 'init-1',
      sender: 'system',
      text: 'J.A.R.V.I.S. core initialized. Ready for live link.',
      time: 'ONLINE',
    },
  ],
  addCommsMessage: (sender, text) =>
    set((state) => ({
      commsLog: [
        ...state.commsLog,
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          sender,
          text,
          time: new Date().toLocaleTimeString(),
        },
      ],
    })),

  // Web intel dossiers
  intelSearchResults: [],
  addIntelResult: (result) =>
    set((state) => ({
      intelSearchResults: [
        {
          id: `intel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          time: new Date().toLocaleTimeString(),
          ...result,
        },
        ...state.intelSearchResults,
      ],
      isIntelOpen: true,
    })),
  clearIntelResults: () => set({ intelSearchResults: [] }),

  // Operator profile and long-term memory vault (server: data/memories.json via /api/memory)
  operatorProfile: {
    callsign: 'Sir',
    assistantName: 'Jarvis',
    voiceName: 'Charon',
    autoBriefing: true,
    enableHumor: false,
    clearance: 'Class-9 Operative',
    role: 'Lead Systems Architect',
    preferences:
      'Prefers a calm, refined, and dryly witty demeanor modeled after J.A.R.V.I.S. Values clear answers, quick execution, and understated humour.',
  },
  setOperatorProfile: (profile) => {
    if (profile?.voiceName) writeStorage('voiceName', profile.voiceName);
    set((state) => ({ operatorProfile: { ...state.operatorProfile, ...profile } }));
  },
  memories: [],
  selectedMemoryModal: null,
  setSelectedMemoryModal: (selectedMemoryModal) => set({ selectedMemoryModal }),
  setMemories: (memories) => set({ memories }),
  addMemory: (memory) =>
    set((state) => ({
      memories: [memory, ...state.memories.filter((m) => m.id !== memory.id)],
    })),
  updateMemory: (memory) =>
    set((state) => ({
      memories: state.memories.map((m) => (m.id === memory.id ? { ...m, ...memory } : m)),
      selectedMemoryModal:
        state.selectedMemoryModal?.id === memory.id
          ? { ...state.selectedMemoryModal, ...memory }
          : state.selectedMemoryModal,
    })),
  removeMemory: (id) =>
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
      selectedMemoryModal: state.selectedMemoryModal?.id === id ? null : state.selectedMemoryModal,
    })),
  loadMemories: async () => {
    try {
      const res = await fetch('/api/memory');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) set({ operatorProfile: data.profile });
        if (data.memories) set({ memories: data.memories });
      }
    } catch (err) {
      console.error('[useJarvisStore] Failed to load memories:', err);
    }
  },
  saveMemoryApi: async ({ content, category = 'tactical', importance = 'medium' }) => {
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category, importance }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.memory) {
          get().addMemory(data.memory);
          return data.memory;
        }
      }
    } catch (err) {
      console.error('[useJarvisStore] Failed to save memory:', err);
    }
    return null;
  },
  updateMemoryApi: async ({ id, content, category, importance }) => {
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_memory', id, content, category, importance }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.memory) {
          get().updateMemory(data.memory);
          return data.memory;
        }
      }
    } catch (err) {
      console.error('[useJarvisStore] Failed to update memory:', err);
    }
    return null;
  },
  deleteMemoryApi: async (id) => {
    try {
      const res = await fetch(`/api/memory?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        get().removeMemory(id);
        return true;
      }
    } catch (err) {
      console.error('[useJarvisStore] Failed to delete memory:', err);
    }
    return false;
  },
  updateProfileApi: async (profileUpdates) => {
    if (profileUpdates?.voiceName) writeStorage('voiceName', profileUpdates.voiceName);
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', profile: profileUpdates }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          get().setOperatorProfile(data.profile);
          return data.profile;
        }
      }
    } catch (err) {
      console.error('[useJarvisStore] Failed to update profile:', err);
    }
    return null;
  },

  // Gemini API key entered in the browser (otherwise the server's GEMINI_API_KEY is used)
  userApiKey: '',
  setUserApiKey: (key) => {
    const trimmed = (key || '').trim();
    writeStorage('apiKey', trimmed);
    set({ userApiKey: trimmed });
  },
  loadStoredApiKey: () => {
    const stored = readStorage('apiKey') || '';
    if (stored) set({ userApiKey: stored });
    return stored;
  },
}));

if (typeof window !== 'undefined') {
  window.__useJarvisStore = useJarvisStore;
}
