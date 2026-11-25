import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
const base = process.env.SELECTION_SITE_URL || "https://select.1add2.com";
const projectRoot = process.env.SELECTION_PROJECT_ROOT || "/Users/xmm/projects/满分选品系统";
const outDir = join(projectRoot, ".worker-runs");
async function json(url, init) { const r = await fetch(url, init); const body = await r.json(); if (!r.ok) throw new Error(body.error || `HTTP ${r.status}`); return body; }
function runCommand(command, args, options = {}) { return new Promise((resolve, reject) => { const child = spawn(command, args, { ...options, stdio: ["ignore", "pipe", "pipe"] }); let out="", err=""; child.stdout.on("data", x => out += x); child.stderr.on("data", x => err += x); child.on("close", code => code === 0 ? resolve({ out, err }) : reject(new Error(err || out || `${command} exited ${code}`))); }); }
function runCodex(prompt) { return runCommand("codex", ["exec", "-C", projectRoot, "--dangerously-bypass-approvals-and-sandbox", prompt]); }
async function loadFeishuEnv() {
  try {
    const text = await readFile(join(projectRoot, "apps", "selection-web", ".env.local"), "utf8");
    const line = text.split(/\r?\n/).find(x => x.startsWith("FEISHU_SELECTION_WEBHOOK_URL="));
    if (line) process.env.FEISHU_SELECTION_WEBHOOK_URL = line.slice(line.indexOf("=") + 1).trim();
  } catch {}
}
const claimed = await json(`${base}/api/selection-requests/claim`, { method: "POST" });
if (!claimed.task) { console.log("No queued selection task."); process.exit(0); }
const task = claimed.task; const runDir = join(outDir, task.id); await mkdir(runDir, { recursive: true });
try {
  const output = join(runDir, "website-report.json");
  const prompt = `你是满分选品工作台的研究 Worker。完成真实的 ${task.mode} 选品任务。用户要求：${task.request}。目标数量：${task.quantity}。必须联网现查，读取并遵守项目 README、docs/00-product-contract.md、docs/07-prompts-and-roles.md、legacy/APP选品系统/docs/12-联网大模型现查研究协议与运行产物规范.md、legacy/APP选品系统/docs/14-产品形态与参考对象分类规范.md，以及 /Users/xmm/.codex/skills/app-opportunity-scout/SKILL.md。生成符合 ${projectRoot}/schemas/website-report.schema.json 的 website-report JSON，写入 ${output}。候选必须有真实竞品、官方链接、证据来源；不能伪造精确数据。对每个可下载 Android APK 的对标产品或参考产品，额外提供 references[].apkDownloads，优先使用 APKMirror、Uptodown、F-Droid、Amazon Appstore、Aurora Store，其次才使用 Aptoide 或 APKPure；每个链接必须是可直接访问的 HTTPS 详情页，逐个联网核验，status 只有在页面和产品匹配时才写 verified，否则写 needs_verification，不要猜测或拼接下载地址。完成后只需确保文件写好。`;
  await runCodex(prompt);
  const report = JSON.parse(await readFile(output, "utf8"));
  const saved = await json(`${base}/api/reports`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(report) });
  await loadFeishuEnv();
  const receipt = join(runDir, "feishu-receipt.json");
  const card = join(runDir, "feishu-card.json");
  const feishu = await runCommand("python3", ["/Users/xmm/.codex/skills/app-selection-feishu-publisher/scripts/publish_feishu.py", "--input", output, "--site-url", base, "--output", card, "--receipt", receipt, "--idempotency-key", `${task.id}:feishu-summary:v1`, "--send"], { env: process.env });
  const feishuResult = JSON.parse(feishu.out.trim().split(/\r?\n/).at(-1));
  if (feishuResult.status !== "completed") throw new Error(`Feishu publish failed: ${feishu.out.trim()}`);
  await json(`${base}/api/selection-requests/update`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: task.id, status: "completed", report_id: saved.id }) });
  console.log(JSON.stringify({ task: task.id, status: "completed", report_id: saved.id, feishu: feishuResult }));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  await json(`${base}/api/selection-requests/update`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: task.id, status: "failed", error: message.slice(0, 1000) }) }).catch(() => {});
  console.error(JSON.stringify({ task: task.id, status: "failed", error: message })); process.exitCode = 1;
}
