// Keep the root entrypoint aligned with the executable worker used by the site.
// The previous version only claimed a task and then reported a capability gap,
// even though the project already provides an inline fallback in site/scripts.
// Delegating here preserves one implementation for research, persistence and
// Feishu idempotency, and still honors SELECTION_SITE_URL/SELECTION_PROJECT_ROOT.
const { spawn } = await import("node:child_process");
const { join } = await import("node:path");
const projectRoot = process.env.SELECTION_PROJECT_ROOT || process.cwd();
const child = spawn(process.execPath, [join(projectRoot, "site", "scripts", "selection-worker.mjs")], {
  stdio: "inherit",
  env: { ...process.env, SELECTION_PROJECT_ROOT: projectRoot },
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exitCode = code ?? 1;
});
