import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

/** Executes shell command synchronously and returns stdout */
function exec(cmd) {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (err) {
    if (err.stdout) return err.stdout.toString().trim();
    throw err;
  }
}

/** Formats UTC date string (e.g. "Nov 6, 2026") */
const formatDate = (d) =>
  d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/** Determines if a commit subject is an automated reverse sync commit */
function isSyncCommit(subject) {
  const s = subject.trim().toLowerCase();
  return (
    s.includes("sync/main-to-dev") ||
    s.includes("reverse merge main into dev") ||
    s.startsWith("chore(sync):") ||
    s.startsWith("merge branch 'main'") ||
    s.startsWith("merge branch 'sync/main-to-dev'") ||
    /merge pull request #\d+ from .*\/sync\/main-to-dev/i.test(subject)
  );
}

/** Parses changesets from .changeset directory */
function getChangesets() {
  const dir = path.resolve(".changeset");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .flatMap((f) => {
      const m = fs.readFileSync(path.join(dir, f), "utf8").match(/^---\n([\s\S]*?)\n---/);
      if (!m) return [];
      return m[1]
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => {
          const [pkg, bump] = l.split(":").map((s) => s.trim().replace(/["']/g, ""));
          return pkg && bump ? { pkg, bump, file: f } : null;
        })
        .filter(Boolean);
    });
}

/** Groups commits by Conventional Commit category */
function groupCommits(commits) {
  const groups = {
    features: [],
    fixes: [],
    refactors: [],
    docs: [],
    chores: [],
    other: [],
  };
  for (const c of commits) {
    const s = c.subject.trim();
    if (/^feat/i.test(s)) groups.features.push(c);
    else if (/^fix/i.test(s)) groups.fixes.push(c);
    else if (/^refactor/i.test(s)) groups.refactors.push(c);
    else if (/^docs/i.test(s)) groups.docs.push(c);
    else if (/^(chore|ci|test|perf|style|build)/i.test(s)) groups.chores.push(c);
    else groups.other.push(c);
  }
  return groups;
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  try {
    exec("git fetch origin main dev");
  } catch {}

  // 1. Verify actual file tree difference between origin/main and origin/dev
  let diff = "";
  try {
    diff = exec("git diff --name-only origin/main..origin/dev");
  } catch {
    diff = exec("git diff --name-only origin/main..HEAD");
  }

  const changedFiles = diff
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (changedFiles.length === 0) {
    console.log("✅ 'dev' and 'main' have identical file trees. No PR needed.");
    try {
      const out = exec("gh pr list --base main --head dev --state open --json number,url");
      const arr = JSON.parse(out || "[]");
      if (arr.length > 0) {
        console.log(`ℹ️ Closing PR #${arr[0].number} (${arr[0].url})...`);
        exec(
          `gh pr close ${arr[0].number} --comment "Automatically closed: dev and main are identical."`,
        );
      }
    } catch {}
    return;
  }

  // 2. Fetch commit history and filter out sync-back commits
  let raw = "";
  try {
    raw = exec('git log origin/main..origin/dev --pretty=format:"%h%x09%s"');
  } catch {
    raw = exec('git log origin/main..HEAD --pretty=format:"%h%x09%s"');
  }

  const allCommits = raw
    ? raw
        .split("\n")
        .filter(Boolean)
        .map((l) => {
          const [h, ...s] = l.split("\t");
          return { hash: h, subject: s.join("\t") };
        })
    : [];
  const commits = allCommits.filter((c) => !isSyncCommit(c.subject));

  console.log(
    `📊 Ahead: ${allCommits.length}, Promotable: ${commits.length}, Files: ${changedFiles.length}`,
  );
  if (commits.length === 0) {
    console.log(
      "✅ No promotable commits between dev and main (only sync-back commits). No PR needed.",
    );
    return;
  }

  const groups = groupCommits(commits);
  const releases = getChangesets();
  const highestBump = releases.some((r) => r.bump === "major")
    ? "major"
    : releases.some((r) => r.bump === "minor")
      ? "minor"
      : "patch";
  const prefix = groups.features.length > 0 || highestBump !== "patch" ? "feat" : "chore";
  const prTitle = `${prefix}: promote dev to main (${formatDate(new Date())})`;

  const list = (items) => items.map((c) => `- \`${c.hash}\` ${c.subject}`).join("\n");
  const sections = [
    "## 🚀 Promotion from `dev` to `main`\n",
    "Automated pull request promoting merged changes from `dev` into `main` for release staging.\n",
  ];

  if (releases.length > 0) {
    sections.push(
      "### 📦 Pending Package Releases\n\n| Package | Release Type | Changeset |\n| :--- | :--- | :--- |",
    );
    for (const r of releases) {
      const b =
        r.bump === "major" ? "🔴 **major**" : r.bump === "minor" ? "🟡 **minor**" : "🟢 **patch**";
      sections.push(`| \`${r.pkg}\` | ${b} | \`.changeset/${r.file}\` |`);
    }
    sections.push("");
  }

  sections.push(`### 📝 Included Commits (${commits.length})\n`);
  const addCategory = (name, items) => {
    if (items.length) sections.push(`#### ${name}\n` + list(items) + "\n");
  };
  addCategory("🚀 Features", groups.features);
  addCategory("🐛 Bug Fixes", groups.fixes);
  addCategory("♻️ Refactoring", groups.refactors);
  addCategory("📝 Documentation", groups.docs);
  addCategory("⚙️ Maintenance & Chores", groups.chores);
  addCategory("📦 Other Commits", groups.other);

  sections.push("### 🛡️ Quality Gate & Release Flow");
  sections.push("- ✅ Validates branch protections and CI quality gates.");
  sections.push("- 📦 Merging into `main` stages production releases.");
  sections.push("- 🔄 Release commits will be reverse-synced back to `dev`.\n");
  sections.push(`*Last automated update: ${new Date().toISOString()}*`);

  const prBody = sections.join("\n");
  if (isDryRun) {
    console.log(`\n📋 PR Title: ${prTitle}\n\n[DRY RUN] Generated Body:\n${prBody}`);
    return;
  }

  const tmpPath = path.resolve(".pr-body-dev-to-main.md");
  fs.writeFileSync(tmpPath, prBody, "utf8");

  let existing = null;
  try {
    const out = exec("gh pr list --base main --head dev --state open --json number,title,url");
    const arr = JSON.parse(out || "[]");
    if (arr.length > 0) existing = arr[0];
  } catch {}

  try {
    if (existing) {
      console.log(`🔄 Updating existing PR #${existing.number} (${existing.url})...`);
      exec(`gh pr edit ${existing.number} --title "${prTitle}" --body-file "${tmpPath}"`);
      console.log(`✅ Successfully updated PR #${existing.number}`);
    } else {
      console.log("📝 Creating new PR from dev to main...");
      const res = exec(
        `gh pr create --base main --head dev --title "${prTitle}" --body-file "${tmpPath}"`,
      );
      console.log(`✅ Created PR: ${res}`);
    }
  } finally {
    try {
      fs.unlinkSync(tmpPath);
    } catch {}
  }
}

main().catch((err) => {
  console.error("❌ Error executing promote-dev-to-main:", err);
  process.exit(1);
});
