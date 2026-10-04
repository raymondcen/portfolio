// SessionStart hook: records the Claude Code session ID in .claude/session.md
// and prints it so Claude has the current ID in context.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const KEEP = 5;

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let data;
try {
  data = JSON.parse(raw);
} catch {
  process.exit(0);
}

const id = data.session_id;
if (!id) process.exit(0);
console.log(`Claude Code session ID: ${id}`);

const root = process.env.CLAUDE_PROJECT_DIR || data.cwd || process.cwd();
const file = join(root, ".claude", "session.md");
const text = existsSync(file) ? readFileSync(file, "utf8") : "";
const eol = text.includes("\r\n") ? "\r\n" : "\n";

// Same session (resume or compact): nothing to write.
if (text.includes(`Current session: \`${id}\``)) process.exit(0);

const stamp = new Date().toLocaleString("sv-SE").slice(0, 16);
const prior = text.split(/\r?\n/).filter((l) => l.startsWith("- `"));
const known = prior.some((l) => l.startsWith(`- \`${id}\``));
const entries = known ? prior : [`- \`${id}\` ${stamp}`, ...prior];

const out = [
  "# Sessions (this machine)",
  `Current session: \`${id}\` (${data.source ?? "startup"}, ${stamp})`,
  "",
  "Recent sessions, newest first. Resume with `claude --resume <id>`.",
  ...entries.slice(0, KEEP),
  "",
].join(eol);

mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, out);
