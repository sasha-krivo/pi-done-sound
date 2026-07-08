import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, resolve as resolvePath } from "node:path";

/**
 * Plays a system notification sound when the agent finishes processing.
 *
 * macOS only. Uses afplay with built-in sounds (/System/Library/Sounds/).
 *
 * Customize the sound by setting the DONE_SOUND environment variable:
 * - A built-in sound name: Glass, Blow, Basso, Bottle, Frog,
 *   Funk, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink
 * - A full path to an audio file (absolute or relative to cwd).
 *
 * Examples:
 *   DONE_SOUND=Ping  pi
 *   DONE_SOUND=/path/to/custom.wav  pi
 */
export default function (pi: ExtensionAPI) {
  pi.on("agent_end", (_event, ctx) => {
    playSound(ctx.ui?.notify);
  });
}

function playSound(notify?: (msg: string, level?: string) => void): void {
  if (process.platform !== "darwin") return;

  const soundPath = resolveSound(notify);
  if (!soundPath) return;

  // Fire-and-forget: don't block agent completion
  execFile("afplay", [soundPath], (err) => {
    if (err) {
      const msg = `[done-sound] Failed to play sound: ${err.message}`;
      if (notify) notify(msg, "error");
      else console.error(msg);
    }
  });
}

function resolveSound(notify?: (msg: string, level?: string) => void): string | null {
  const env = process.env.DONE_SOUND?.trim();
  if (!env) {
    const defaultSnd = defaultSound();
    if (!defaultSnd) {
      const msg = `[done-sound] Default sound not found. Please set DONE_SOUND to a valid sound file.`;
      if (notify) notify(msg, "error");
      else console.error(msg);
      return null;
    }
    return defaultSnd;
  }

  // Absolute or relative path: resolve against cwd and validate
  if (env.includes("/")) {
    const expanded = env.startsWith("~") ? resolvePath(homedir(), env.slice(1)) : env;
    const resolved = isAbsolute(expanded) ? expanded : resolvePath(process.cwd(), expanded);
    if (!existsSync(resolved)) {
      const msg = `[done-sound] Sound file not found: ${env}. Please specify a valid absolute or relative path to a sound file.`
      if (notify) notify(msg, "error");
      else console.error(msg);
      return null;
    }
    return resolved;
  }

  // Treat as a macOS built-in sound name
  const path = `/System/Library/Sounds/${env}.aiff`;
  if (!existsSync(path)) {
    const msg =
      `[done-sound] Unknown macOS sound name: "${env}". ` +
      `Valid names: Glass, Blow, Basso, Bottle, Frog, Funk, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink.`;
    if (notify) notify(msg, "error");
    else console.error(msg);
    return null;
  }
  return path;
}

function defaultSound(): string | null {
  const path = "/System/Library/Sounds/Glass.aiff";
  if (!existsSync(path)) return null;
  return path;
}