import { redis } from "../startup/redis.js";

const VERSION_KEY = "content:version";

export async function getContentVersion() {
  try {
    const v = await redis.get(VERSION_KEY);
    return v ? String(v) : "1";
  } catch {
    return "1";
  }
}

export async function bumpContentVersion() {
  try {
    if (typeof redis.incr === "function") {
      const n = await redis.incr(VERSION_KEY);
      return String(n);
    }
    const cur = parseInt((await redis.get(VERSION_KEY)) || "1", 10);
    const next = Number.isFinite(cur) ? cur + 1 : 2;
    await redis.set(VERSION_KEY, String(next));
    return String(next);
  } catch {
    return null;
  }
}

export async function versionedKey(baseKey) {
  const v = await getContentVersion();
  return `${baseKey}:v${v}`;
}

