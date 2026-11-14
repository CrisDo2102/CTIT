import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getImageryCategories, getImageryCategory, imageryPhotoUrl, isImageryFile } from "@/lib/imagery";

const directories: string[] = [];

async function sandbox() {
  const dir = await mkdtemp(path.join(tmpdir(), "ctit-imagery-"));
  directories.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("Imagery — file-based library", () => {
  it("returns an empty catalog when Imagery folder does not exist", async () => {
    const dir = await sandbox();
    expect(await getImageryCategories(path.join(dir, "missing"))).toEqual([]);
  });

  it("reads directories as categories and orders supported image files", async () => {
    const dir = await sandbox();
    await mkdir(path.join(dir, "Physics"));
    await mkdir(path.join(dir, "Math"));
    await mkdir(path.join(dir, ".private"));
    await writeFile(path.join(dir, "Physics", "Newton_02.PNG"), "test");
    await writeFile(path.join(dir, "Physics", "Newton_01.jpg"), "test");
    await writeFile(path.join(dir, "Physics", "notes.md"), "no");
    await writeFile(path.join(dir, "Physics", ".secret.png"), "no");
    await mkdir(path.join(dir, "Physics", "nested"));

    const categories = await getImageryCategories(dir);
    expect(categories.map((category) => category.name)).toEqual(["Math", "Physics"]);
    expect(categories[0].photos).toHaveLength(0);
    expect(categories[1].photos.map((photo) => photo.filename)).toEqual(["Newton_01.jpg", "Newton_02.PNG"]);
    expect(categories[1].cover).toBe("/images/Imagery/Physics/Newton_01.jpg");
    expect((await getImageryCategory("Other", dir))).toBeNull();
    expect((await getImageryCategory("Physics", dir))?.photos).toHaveLength(2);
  });

  it("encodes folder names and photo filenames for safe public URLs", () => {
    expect(imageryPhotoUrl("Vật lý & điện", "Mạch #1.jpg"))
      .toBe("/images/Imagery/V%E1%BA%ADt%20l%C3%BD%20%26%20%C4%91i%E1%BB%87n/M%E1%BA%A1ch%20%231.jpg");
    expect(isImageryFile("diagram.webp")).toBe(true);
    expect(isImageryFile("image.svg")).toBe(false);
    expect(isImageryFile("document.pdf")).toBe(false);
    expect(isImageryFile(".private.png")).toBe(false);
  });
});
