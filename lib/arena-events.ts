type EventConfig = {
  id: string;
  title: string;
  message: string;
  gif_url: string;
  audio_url?: string;
  duration: number;
  active: boolean;
};

export const DEFAULT_EVENT_CONFIG: Record<string, EventConfig> = {
  leader: {
    id: "leader",
    title: "NOVO LÍDER!",
    message: "Assumiu a ponta! 👑",
    gif_url: "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3",
    duration: 8000,
    active: true
  },
  sale: {
    id: "sale",
    title: "NOVA VENDA!",
    message: "Mais uma pra conta! 💸",
    gif_url: "https://media.giphy.com/media/l0Ex6kAKAoFRsFh6M/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3",
    duration: 5000,
    active: true
  },
  big_sale: {
    id: "big_sale",
    title: "BIG SALE!!!",
    message: "Venda GIGANTE detectada! 💰💰💰",
    gif_url: "https://media.giphy.com/media/vxTbZfV7T1h56/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/320/320653_5260872-lq.mp3",
    duration: 7000,
    active: true
  },
  level_up: {
    id: "level_up",
    title: "META BATIDA!",
    message: "Superou 100% da meta! 🌟",
    gif_url: "https://media.giphy.com/media/mi6DsSSNKDbUY/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3",
    duration: 6000,
    active: true
  },
  combo: {
    id: "combo",
    title: "COMBO BREAKER!",
    message: "Vendas em sequência! 🔥",
    gif_url: "https://media.giphy.com/media/CjmvTCZf2U3p09Cn0h/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/270/270545_5123851-lq.mp3",
    duration: 5000,
    active: true
  },
  global_goal: {
    id: "global_goal",
    title: "META GLOBAL ATINGIDA!",
    message: "PARABÉNS TIME!!! 🎉🎉🎉",
    gif_url: "https://media.giphy.com/media/VuTqN2H7Vf9jK/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3",
    duration: 10000,
    active: true
  },
  last_mile: {
    id: "last_mile",
    title: "RETA FINAL!",
    message: "Falta muito pouco! Vamos lá! 🚨",
    gif_url: "https://media.giphy.com/media/l0HlOaQcLJ2hHpYcw/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/171/171673_2437358-lq.mp3",
    duration: 5000,
    active: true
  },
  early_bird: {
    id: "early_bird",
    title: "EARLY BIRD!",
    message: "Abriu a porteira do dia! 🌅",
    gif_url: "https://media.giphy.com/media/12noFudALzfIynTgLv/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/270/270396_5123851-lq.mp3",
    duration: 5000,
    active: true
  },
  synergy: {
    id: "synergy",
    title: "SINERGIA!",
    message: "Vendas simultâneas! Toca aqui! ✋",
    gif_url: "https://media.giphy.com/media/xT5LMHxhOfscxPfIfu/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/270/270409_5123851-lq.mp3",
    duration: 5000,
    active: true
  },
  bounty: {
    id: "bounty",
    title: "NA MOSCA!",
    message: "Valor exato! Que precisão! 🎯",
    gif_url: "https://media.giphy.com/media/3o7qDEq2bMbcbPRQ2c/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/320/320672_5260872-lq.mp3",
    duration: 5000,
    active: true
  },
  ice_breaker: {
    id: "ice_breaker",
    title: "QUEBROU O GELO!",
    message: "De volta ao jogo! 🧊🔨",
    gif_url: "https://media.giphy.com/media/3o7aCS5o3M7KxY3iQ8/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/320/320654_5260872-lq.mp3",
    duration: 5000,
    active: true
  },
  google: {
    id: "google",
    title: "GOOGLE BÔNUS!",
    message: "Dominou o Google! 🚀",
    gif_url: "https://media.giphy.com/media/3oKIPm3BynUpUysTHW/giphy.gif",
    audio_url: "https://cdn.freesound.org/previews/171/171671_2437358-lq.mp3",
    duration: 5000,
    active: true
  }
};

export function mergeEventConfig(type: string, dbConfig?: Partial<EventConfig>): EventConfig {
  const base = DEFAULT_EVENT_CONFIG[type] || DEFAULT_EVENT_CONFIG["leader"];
  const merged: EventConfig = {
    id: base.id,
    title: dbConfig?.title ?? base.title,
    message: dbConfig?.message ?? base.message,
    gif_url: dbConfig?.gif_url ?? base.gif_url,
    audio_url: dbConfig?.audio_url ?? base.audio_url,
    duration: typeof dbConfig?.duration === "number" && dbConfig.duration > 0 ? dbConfig.duration : base.duration,
    active: dbConfig?.active ?? base.active
  };
  return merged;
}

export function getFinalEventConfig(eventConfigs: Record<string, Partial<EventConfig>>, type: string): EventConfig {
  const dbConfig = eventConfigs[type];
  const cfg = mergeEventConfig(type, dbConfig);
  return cfg;
}

export function isEventActive(eventConfigs: Record<string, Partial<EventConfig>>, type: string): boolean {
  const dbConfig = eventConfigs[type];
  if (typeof dbConfig?.active === "boolean") return dbConfig.active;
  const base = DEFAULT_EVENT_CONFIG[type] || DEFAULT_EVENT_CONFIG["leader"];
  return base.active;
}
