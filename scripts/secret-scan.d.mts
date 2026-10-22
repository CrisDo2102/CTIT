export type Finding = { rule: string; line: number };
export type RepoFinding = Finding & { file: string };
export const RULES: { id: string; re: RegExp }[];
export function scanText(text: string): Finding[];
export function listFiles(root: string): { files: string[]; mode: "git" | "walk" };
export function scanRepo(root: string): { findings: RepoFinding[]; scanned: number; mode: "git" | "walk" };
