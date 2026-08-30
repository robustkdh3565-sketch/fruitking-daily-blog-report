import fs from "node:fs";

const file = new URL("./data/2026-08-30-verified-sources.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
if (!data.checkedAt || !Array.isArray(data.selected) || !Array.isArray(data.rejected)) throw new Error("VERIFIED_SOURCE_STRUCTURE_INVALID");
if (data.selected.length > 3) throw new Error("SELECTED_SOURCE_LIMIT_EXCEEDED");
for (const [index, source] of data.selected.entries()) {
  for (const field of ["community", "title", "url", "story"]) if (!source[field]) throw new Error(`VERIFIED_SOURCE_FIELD_MISSING selected[${index}].${field}`);
  if (!/^https:\/\//.test(source.url)) throw new Error(`VERIFIED_SOURCE_URL_INVALID selected[${index}]`);
  if (source.story.trim().length < 80) throw new Error(`VERIFIED_SOURCE_STORY_TOO_SHORT selected[${index}]`);
  if (source.verified !== true) throw new Error(`VERIFIED_SOURCE_NOT_CONFIRMED selected[${index}]`);
  if (!Array.isArray(source.reactions) || source.reactions.length < 2) throw new Error(`VERIFIED_SOURCE_REACTIONS_MISSING selected[${index}]`);
}
for (const [index, source] of data.rejected.entries()) {
  if (!/^https:\/\//.test(source.url || "") || String(source.reason || "").length < 20) throw new Error(`REJECTED_SOURCE_REASON_INVALID rejected[${index}]`);
}
console.log("verified source records passed");
