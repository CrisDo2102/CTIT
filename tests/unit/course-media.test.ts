import { describe, expect, it } from "vitest";
import { lessonEmbed } from "../../lib/course-media";

describe("lessonEmbed", () => {
  it("preserves a lesson time marker", () => {
    expect(lessonEmbed("https://youtu.be/abcdefghijk?t=1m20s")).toBe("https://www.youtube-nocookie.com/embed/abcdefghijk?rel=0&start=80");
  });
  it("accepts watch and privacy-enhanced embed links", () => {
    expect(lessonEmbed("https://www.youtube.com/watch?v=abcdefghijk")).toContain("/embed/abcdefghijk?");
    expect(lessonEmbed("https://www.youtube-nocookie.com/embed/abcdefghijk?start=60")).toContain("start=60");
  });
  it("rejects lookalike domains and active URL schemes", () => {
    for (const url of ["https://youtube.com.evil.test/watch?v=abcdefghijk", "javascript:alert(1)", "http://youtu.be/abcdefghijk", "https://example.com/file.pdf"]) expect(lessonEmbed(url)).toBeNull();
  });
  it("rejects invalid IDs and unsupported playlists", () => {
    expect(lessonEmbed("https://www.youtube.com/watch?v=bad")).toBeNull();
    expect(lessonEmbed("https://www.youtube.com/playlist?list=abc")).toBeNull();
  });
});
