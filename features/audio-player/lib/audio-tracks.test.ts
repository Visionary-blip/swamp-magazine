import { describe, expect, it } from "vitest";

import { pickTrack, type AudioTrack } from "./audio-tracks";

function track(src: string): AudioTrack {
  return { src, credit: "X", name: "Y", instagramHandle: "z" };
}

const [a, b, c] = [track("/a.wav"), track("/b.wav"), track("/c.wav")];

describe("pickTrack", () => {
  it("returns null with no tracks", () => {
    expect(pickTrack([], null)).toBeNull();
  });

  it("returns the only track even if it was just played", () => {
    expect(pickTrack([a], a)).toBe(a);
  });

  it("never repeats the previous track when there is a choice", () => {
    for (const roll of [0, 0.3, 0.99]) {
      expect(pickTrack([a, b, c], b, () => roll)).not.toBe(b);
    }
  });
});
