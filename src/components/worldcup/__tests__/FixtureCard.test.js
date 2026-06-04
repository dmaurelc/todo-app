import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FixtureCard from "../FixtureCard.vue";

const baseFixture = {
  fixture: {
    id: 1,
    date: "2026-06-11T20:00:00Z",
    status: { short: "NS" },
  },
  league: { round: "Group Stage - Matchday 1" },
  teams: {
    home: { name: "Argentina", logo: "https://example.com/ar.png" },
    away: { name: "Brazil", logo: "https://example.com/br.png" },
  },
  goals: { home: null, away: null },
};

describe("FixtureCard", () => {
  it("renders both team names and a logo image per side", () => {
    const wrapper = mount(FixtureCard, { props: { fixture: baseFixture } });
    expect(wrapper.text()).toContain("Argentina");
    expect(wrapper.text()).toContain("Brazil");
    const imgs = wrapper.findAll("img");
    expect(imgs).toHaveLength(2);
    expect(imgs[0].attributes("src")).toBe("https://example.com/ar.png");
    expect(imgs[1].attributes("src")).toBe("https://example.com/br.png");
  });

  it("shows the score when status is FT", () => {
    const fixture = {
      ...baseFixture,
      fixture: { ...baseFixture.fixture, status: { short: "FT" } },
      goals: { home: 2, away: 1 },
    };
    const wrapper = mount(FixtureCard, { props: { fixture } });
    expect(wrapper.text()).toContain("2 - 1");
    expect(wrapper.text()).toContain("Final");
  });

  it("shows EN VIVO badge for in-progress statuses", () => {
    const fixture = {
      ...baseFixture,
      fixture: { ...baseFixture.fixture, status: { short: "2H" } },
      goals: { home: 1, away: 0 },
    };
    const wrapper = mount(FixtureCard, { props: { fixture } });
    expect(wrapper.text()).toContain("EN VIVO");
  });

  it("falls back gracefully when team logos are missing", () => {
    const fixture = {
      ...baseFixture,
      teams: {
        home: { name: "Local" },
        away: { name: "Visita" },
      },
    };
    const wrapper = mount(FixtureCard, { props: { fixture } });
    expect(wrapper.findAll("img")).toHaveLength(0);
    expect(wrapper.text()).toContain("Local");
    expect(wrapper.text()).toContain("Visita");
  });
});
