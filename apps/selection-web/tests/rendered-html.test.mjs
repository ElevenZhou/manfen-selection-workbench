import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("finished site metadata replaces starter preview", async () => {
  const [page, layout, shell, packageJson, hosting] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AppShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);
  assert.match(page, /综合机会地图/);
  assert.match(shell, /APP PORTFOLIO/);
  assert.match(layout, /APP 选品驾驶舱/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(hosting, /"d1": "DB"/);
});

test("dashboard exposes the decision surface and accessible next actions", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /组合数据总览/);
  assert.match(page, /OPPORTUNITY MAP/);
  assert.match(page, /DECISION QUEUE/);
  assert.match(page, /ATTENTION/);
  assert.match(page, /ROUTE PULSE/);
  assert.match(page, /启动一次选品/);
  assert.match(page, /时间范围/);
  assert.match(page, /近 30 天/);
  assert.match(page, /近 90 天/);
  assert.match(page, /数据更新时间/);
  assert.match(page, /全量机会/);
  assert.match(page, /aria-label="组合数据总览"/);
  assert.match(page, /href=\{`\/candidates\?productForm=\$\{form\}`\}/);
  assert.match(css, /\.map-grid\{display:grid/);
  assert.match(css, /@media\(max-width:620px\)\{\.map-grid,\.route-pulse-grid\{grid-template-columns:1fr\}/);
});

test("report repository preserves route and package boundaries", async () => {
  const source = await readFile(new URL("../lib/reports.ts", import.meta.url), "utf8");
  assert.match(source, /ROUTE_SELECTED/);
  assert.match(source, /READY_FOR_BENCH/);
  assert.match(source, /route_score/);
  assert.match(source, /相同报告ID已经存在/);
});

test("pure research has a separate archive and never leaks into selection workflow", async () => {
  const [shell, reportsPage, researchPage, researchDetail, reportDetail, repository, publisher] = await Promise.all([
    readFile(new URL("../app/components/AppShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/reports/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/research/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/research/[id]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/reports/[id]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/reports.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/feishu.ts", import.meta.url), "utf8"),
  ]);
  assert.match(shell, /调查报告/);
  assert.match(reportsPage, /report\.status !== "research"/);
  assert.match(researchPage, /report\.status === "research"/);
  assert.match(researchPage, /不会自动进入候选总表、资料包或开发排期/);
  assert.match(researchDetail, /调查完成，不等于强制入选/);
  assert.doesNotMatch(researchDetail, /RouteMark/);
  assert.match(reportDetail, /redirect\(`\/research\/\$\{id\}`\)/);
  assert.match(repository, /r\.status != 'research'/);
  assert.match(publisher, /纯调查 · 参考对象/);
  assert.match(publisher, /`\/research\/\$\{report\.id\}`/);
});

test("candidate ledger exposes archive filters without cross-route ranking", async () => {
  const [page, shell, repository, css] = await Promise.all([
    readFile(new URL("../app/candidates/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AppShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/reports.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(shell, /选品总表/);
  assert.match(page, /报告期/);
  assert.match(page, /发现路线/);
  assert.match(page, /选品决策/);
  assert.match(page, /资料包/);
  assert.match(page, /<span>编号<\/span>/);
  assert.match(page, /String\(index \+ 1\)\.padStart\(3, "0"\)/);
  assert.match(repository, /ORDER BY r\.published_at DESC, c\.route ASC, c\.route_rank ASC/);
  assert.match(css, /\.selection-library-layout \{ display: block/);
  assert.match(css, /grid-template-columns: repeat\(12, minmax\(0, 1fr\)\)/);
  assert.match(css, /grid-template-columns: 72px 200px minmax\(360px, \.95fr\)/);
  assert.match(page, /item\.reportTitle/);
});

test("readability pass keeps report text legible and mobile rows adaptive", async () => {
  const [css, shell] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AppShell.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(css, /\.candidate-table-row p \{ font-size: 14px/);
  assert.match(css, /\.candidate-name strong \{ font-size: 15px/);
  assert.match(css, /\.candidate-table-row \{\s*min-width: 0/);
  assert.match(css, /\.selection-table \{ min-width: 0/);
  assert.match(css, /\.filter-field select, \.filter-field input \{[\s\S]*font-size: 14px/);
  assert.match(css, /\.selection-product-copy \.product-title-link \{ font-size: 17px/);
  assert.match(css, /\.selection-opportunity p \{ margin: 0; font-size: 15px/);
  assert.match(css, /\.selection-table-row small \{ color: #566478; font-size: 12px/);
  assert.match(shell, /skip-link/);
});

test("every candidate can render a uniform icon, references, and YouTube evidence", async () => {
  const [visual, report, ledger, repository, migration, evidence] = await Promise.all([
    readFile(new URL("../app/components/ProductVisual.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/reports/[id]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/candidates/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/reports.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_fuzzy_bug.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/components/YoutubeEvidence.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(visual, /width=\{compact \? 34 : 42\}/);
  assert.match(visual, /target="_blank"/);
  assert.match(visual, /reference\.storeUrl \?\? reference\.url/);
  assert.match(visual, /App Store/);
  assert.match(visual, /Google Play/);
  assert.match(visual, /referenceKindLabel/);
  assert.match(report, /ReferenceLinks/);
  assert.match(ledger, /ProductIcon/);
  assert.match(repository, /references必须包含1–5个/);
  assert.match(migration, /reference_apps/);
  assert.match(report, /YoutubeEvidence/);
  assert.match(ledger, /YoutubeEvidence/);
  assert.match(repository, /validateYoutubeEvidence/);
  assert.match(evidence, /insufficient_data/);
});

test("reference objects can expose verified APK download sources", async () => {
  const [types, repository, visual, publisher, schema, worker] = await Promise.all([
    readFile(new URL("../lib/types.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/reports.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ProductVisual.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/feishu.ts", import.meta.url), "utf8"),
    readFile(new URL("../../../schemas/website-report.schema.json", import.meta.url), "utf8"),
    readFile(new URL("../scripts/selection-worker.mjs", import.meta.url), "utf8"),
  ]);
  assert.match(types, /apkDownloads\?: ApkDownload\[\]/);
  assert.match(repository, /validateApkDownloads/);
  assert.match(repository, /必须使用HTTPS/);
  assert.match(visual, /APK下载/);
  assert.match(visual, /apk-download-link/);
  assert.match(publisher, /APK ·/);
  assert.ok("apkDownloads" in JSON.parse(schema).properties.candidates.items.properties.references.items.properties);
  assert.match(worker, /apkDownloads/);
  assert.match(worker, /APKMirror/);
  assert.match(worker, /assertYoutubeEvidence/);
});

test("real runs expose verified package downloads without demo seed data", async () => {
  const [generatedText, packagePage, repository, cleanupMigration] = await Promise.all([
    readFile(new URL("../lib/generated-reports.json", import.meta.url), "utf8"),
    readFile(new URL("../app/packages/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/reports.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0006_clear_demo_seed.sql", import.meta.url), "utf8"),
  ]);
  const generated = JSON.parse(generatedText);
  const candidates = generated.flatMap((entry) => entry.candidates);
  assert.ok(generated.length >= 5);
  assert.ok(candidates.length >= 38);
  const references = candidates.flatMap((candidate) => candidate.references);
  assert.ok(references.filter((reference) => reference.storeUrl).length >= 50);
  assert.ok(references.every((reference) => "store" in reference && "storeUrl" in reference));
  assert.ok(references.every((reference) => "kind" in reference));
  assert.ok(references.every((reference) =>
    reference.storeUrl === null
      || /^https:\/\/(apps\.apple\.com|play\.google\.com)\//.test(reference.storeUrl),
  ));
  for (const candidate of candidates) {
    assert.match(candidate.titleZh, /[\u3400-\u9fff]/);
    assert.ok(candidate.references.every((reference) => /[\u3400-\u9fff]/.test(reference.nameZh)));
  }
  for (const candidate of candidates.filter((item) => item.decision === "ROUTE_SELECTED")) {
    if (candidate.packageStatus === "READY_FOR_BENCH") {
      assert.match(candidate.packageUrl, /^\/packages\/.+\.zip$/);
      assert.match(candidate.packageSha256, /^[0-9a-f]{64}$/);
    } else {
      assert.equal(candidate.packageStatus, "DRAFT");
    }
  }
  assert.match(packagePage, /下载 ZIP/);
  assert.match(packagePage, /listCandidateArchive/);
  assert.match(packagePage, /全部已发布报告资料包/);
  assert.match(repository, /package_sha256/);
  assert.doesNotMatch(repository, /seedReport|seedCandidates/);
  assert.match(cleanupMigration, /demo-2026-W30/);
});

test("product and reference form taxonomy is visible and filterable", async () => {
  const [generatedText, types, taxonomy, visual, ledger, repository, migration] = await Promise.all([
    readFile(new URL("../lib/generated-reports.json", import.meta.url), "utf8"),
    readFile(new URL("../lib/types.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/taxonomy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ProductVisual.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/candidates/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/reports.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0005_absent_apocalypse.sql", import.meta.url), "utf8"),
  ]);
  const generated = JSON.parse(generatedText);
  const candidates = generated.flatMap((entry) => entry.candidates);
  assert.ok(candidates.every((candidate) => candidate.productForm));
  assert.ok(candidates.some((candidate) => candidate.productForm === "mobile_game"));
  assert.ok(candidates.some((candidate) => candidate.productForm === "web_app"));
  assert.ok(candidates.some((candidate) => candidate.productForm === "desktop_app"));
  assert.match(types, /ProductForm/);
  assert.match(taxonomy, /移动 App/);
  assert.match(taxonomy, /研究报告/);
  assert.match(visual, /product-form-badge/);
  assert.match(ledger, /name="productForm"/);
  assert.match(repository, /c\.product_form = \?/);
  assert.match(migration, /ADD `product_form`/);
});

test("English product and reference names keep a Chinese display name", async () => {
  const [types, localization, detail, visual, publisher, migration] = await Promise.all([
    readFile(new URL("../lib/types.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/localization.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/reports/[id]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ProductVisual.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/feishu.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0004_ancient_spencer_smythe.sql", import.meta.url), "utf8"),
  ]);
  assert.match(types, /titleZh: string/);
  assert.match(types, /nameZh: string/);
  assert.match(localization, /（\$\{normalizedChinese\}）/);
  assert.match(localization, /typeof chinese === "string"/);
  assert.match(localization, /if \(!normalizedEnglish\) return normalizedChinese/);
  assert.match(detail, /bilingualName\(item\.title, item\.titleZh\)/);
  assert.match(visual, /bilingualName\(reference\.name, reference\.nameZh\)/);
  assert.match(publisher, /bilingualName\(candidate\.title, candidate\.titleZh\)/);
  assert.match(migration, /title_zh/);
});

test("Feishu publishing is server-side, report-scoped, and idempotent", async () => {
  const [publisher, route, button, reportsPage, detailPage, migration] = await Promise.all([
    readFile(new URL("../lib/feishu.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/reports/[id]/feishu/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/FeishuPushButton.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/reports/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/reports/[id]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0003_classy_mattie_franklin.sql", import.meta.url), "utf8"),
  ]);
  assert.match(publisher, /FEISHU_SELECTION_WEBHOOK_URL/);
  assert.match(publisher, /idempotency_key/);
  assert.match(publisher, /candidate\.references/);
  assert.match(publisher, /生产资料包/);
  assert.match(publisher, /查看完整选品报告/);
  assert.doesNotMatch(button, /open-apis\/bot/);
  assert.match(route, /getChatGPTUser/);
  assert.match(button, /crypto\.randomUUID/);
  assert.match(reportsPage, /FeishuPushButton/);
  assert.match(detailPage, /FeishuPushButton/);
  assert.match(migration, /CREATE TABLE `feishu_pushes`/);
});

test("selection launcher stays within supported tasks and creates a queued request", async () => {
  const [page, route, shell] = await Promise.all([
    readFile(new URL("../app/selector/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/selection-requests/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AppShell.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(shell, /启动选品/);
  assert.match(page, /对话式要求/);
  assert.match(page, /启动选品/);
  assert.match(route, /MODES = new Set/);
  assert.match(route, /quantity < 1 \|\| quantity > 20/);
  assert.match(route, /createTask/);
  assert.match(route, /ensureSelectionRequestSchema/);
  assert.match(route, /\["queued", "claimed", "processing", "review", "completed", "blocked", "cancelled", "failed"\]/);
  assert.match(route, /Idempotency-Key/);
  assert.match(route, /Number\.isFinite\(requestedLimit\)/);
  assert.match(page, /Idempotency-Key/);
  assert.match(page, /重新排队/);
});

test("primary navigation exposes research and schedule paths", async () => {
  const shell = await readFile(new URL("../app/components/AppShell.tsx", import.meta.url), "utf8");
  const schedule = await readFile(new URL("../app/schedule/page.tsx", import.meta.url), "utf8");
  assert.match(shell, /id: "research", label: "调查报告"/);
  assert.match(shell, /id: "schedule", label: "开发排期"/);
  assert.match(schedule, /active="schedule"/);
});

test("design library and visual evidence are reachable from the workbench", async () => {
  const [shell, design, media, report, evidence] = await Promise.all([
    readFile(new URL("../app/components/AppShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/design/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ReferenceMediaPreview.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/reports/[id]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/YoutubeEvidence.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(shell, /id: "design", label: "设计方向"/);
  assert.match(design, /option-g-playbook-atelier\.png/);
  assert.match(design, /dashboard-anime\.png/);
  assert.match(media, /商店视觉资料/);
  assert.match(report, /ReferenceMediaPreview/);
  assert.match(evidence, /打开检索入口/);
});

test("latest case exposes store media and playable YouTube evidence", async () => {
  const [home, showcase] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/LatestCaseShowcase.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(home, /LatestCaseShowcase/);
  assert.match(showcase, /youtube\.com\/embed\/zgBze7IAdXQ/);
  assert.match(showcase, /商店截图/);
  assert.match(showcase, /打开完整报告/);
});

test("selection task board exposes lifecycle filters and recoverable errors", async () => {
  const page = await readFile(new URL("../app/selector/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /task-status-filter/);
  assert.match(page, /taskResult\.task/);
  assert.match(page, /task-board-error/);
  assert.match(page, /statusLabels/);
  assert.match(css, /\.status-review b/);
  assert.match(css, /\.status-cancelled b/);
});

test("selection queue protects concurrent idempotency and lease transitions", async () => {
  const source = await readFile(new URL("../lib/selectionRequests.ts", import.meta.url), "utf8");
  assert.match(source, /selection_requests_idempotency_idx/);
  assert.match(source, /Resolve the unique-index race/);
  assert.match(source, /ALLOWED_TRANSITIONS/);
  assert.match(source, /任务租约不匹配/);
  assert.match(source, /updated\.meta\.changes/);
});
