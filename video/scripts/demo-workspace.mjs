// Copies video/fixtures/persephone/ to C:\Demo, the neutral folder the videos show (Explorer prints
// the full root path), and makes weather-station a small git repository so the Git panel and the
// Git graph have a short history.
//
//   node video/scripts/demo-workspace.mjs
//
// Files from the fixtures overwrite their copies; anything else in C:\Demo is kept (for example
// home-budget/.persephone/boards/Budget, which the platform video's agent session builds).
import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "persephone");
const target = "C:/Demo";
const station = path.join(target, "weather-station");
const env = { ...process.env, GIT_AUTHOR_NAME: "Weather Station", GIT_AUTHOR_EMAIL: "station@example.com",
    GIT_COMMITTER_NAME: "Weather Station", GIT_COMMITTER_EMAIL: "station@example.com" };
const git = (...args) => execFileSync("git", args, { cwd: station, env, stdio: "pipe" });
// fs.cpSync crashes the process (0xC0000409) on this machine, so copy by hand.
function copyTree(from, to) {
    mkdirSync(to, { recursive: true });
    for (const entry of readdirSync(from, { withFileTypes: true })) {
        const a = path.join(from, entry.name);
        const b = path.join(to, entry.name);
        if (entry.isDirectory()) copyTree(a, b);
        else copyFileSync(a, b);
    }
}

rmSync(station, { recursive: true, force: true });
copyTree(source, target);

// Three commits; notes/todo.md stays uncommitted so Git shows one changed file.
git("init", "-q", "-b", "main");
git("add", "README.md", "package.json", "src", "data/stations.json");
git("commit", "-q", "-m", "Collector and station list");
git("add", "data", "docs", "notes/ideas.md");
git("commit", "-q", "-m", "First day of readings and architecture notes");
git("add", ".persephone");
git("commit", "-q", "-m", "Station dashboard board");
console.log("ready:", target);
