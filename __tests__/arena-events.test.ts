import { describe, it, expect } from "vitest";
import { DEFAULT_EVENT_CONFIG, getFinalEventConfig, isEventActive, mergeEventConfig } from "@/lib/arena-events";

describe("Arena Event Config Merge", () => {
  it("usa defaults quando não há config no banco", () => {
    const cfg = getFinalEventConfig({}, "sale");
    expect(cfg.title).toBe(DEFAULT_EVENT_CONFIG.sale.title);
    expect(cfg.audio_url).toBeDefined();
    expect(cfg.gif_url).toBeDefined();
    expect(cfg.duration).toBeGreaterThan(0);
    expect(cfg.active).toBe(true);
  });

  it("mescla parciais do banco preservando áudio e gif padrão", () => {
    const cfg = getFinalEventConfig(
      { sale: { title: "Venda Teste", audio_url: undefined, gif_url: undefined } },
      "sale"
    );
    expect(cfg.title).toBe("Venda Teste");
    expect(cfg.audio_url).toBe(DEFAULT_EVENT_CONFIG.sale.audio_url);
    expect(cfg.gif_url).toBe(DEFAULT_EVENT_CONFIG.sale.gif_url);
  });

  it("respeita active=false vindo do banco", () => {
    const active = isEventActive({ sale: { active: false } }, "sale");
    expect(active).toBe(false);
  });

  it("duration inválida ou zero cai no default", () => {
    const merged = mergeEventConfig("big_sale", { duration: 0 });
    expect(merged.duration).toBe(DEFAULT_EVENT_CONFIG.big_sale.duration);
  });
});

describe("Cobertura de eventos com áudio", () => {
  const types = Object.keys(DEFAULT_EVENT_CONFIG);
  it("todos os tipos têm áudio padrão definido (quando aplicável)", () => {
    for (const t of types) {
      const cfg = getFinalEventConfig({}, t);
      expect(cfg.duration).toBeGreaterThan(0);
      expect(cfg.title.length).toBeGreaterThan(0);
      if (["leader","sale","big_sale","level_up","combo","global_goal","last_mile","early_bird","synergy","bounty","ice_breaker","google"].includes(t)) {
        expect(cfg.audio_url).toBeDefined();
      }
    }
  });
});
