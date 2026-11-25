import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const projectRoot = "/Users/xmm/projects/APP选品系统";
const outputDir = `${projectRoot}/outputs/weekly-factory-2026-07-25`;
const previewDir = `${projectRoot}/.autoloop/weekly-factory/qa/workbook-previews`;
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const wb = Workbook.create();
const dashboard = wb.worksheets.add("Dashboard");
const candidates = wb.worksheets.add("Weekly Candidates");
const competitors = wb.worksheets.add("Competitor Evidence");
const reviews = wb.worksheets.add("Review Themes");
const briefs = wb.worksheets.add("Product Briefs");
const queue = wb.worksheets.add("Build Queue");
const capacity = wb.worksheets.add("Capacity & Rules");
const website = wb.worksheets.add("Website Publish");
const sources = wb.worksheets.add("Data Sources");

const navy = "#132238";
const blue = "#1F5EFF";
const teal = "#0F8B8D";
const cyan = "#DDF7F6";
const paleBlue = "#EAF0FF";
const paleYellow = "#FFF4CC";
const paleGreen = "#E3F6E8";
const paleRed = "#FDE8E7";
const gray = "#667085";
const lightGray = "#EEF1F5";
const white = "#FFFFFF";

function title(sheet, range, text, subtitle = "") {
  sheet.getRange(range).merge();
  sheet.getRange(range).values = [[text]];
  sheet.getRange(range).format = {
    fill: navy,
    font: { bold: true, color: white, size: 18 },
    verticalAlignment: "center",
  };
  sheet.getRange(range).format.rowHeight = 34;
  if (subtitle) {
    const startCol = range.split(":")[0].replace(/[0-9]/g, "");
    const endCol = range.split(":")[1].replace(/[0-9]/g, "");
    const row = Number(range.split(":")[1].match(/[0-9]+/)[0]) + 1;
    const subRange = `${startCol}${row}:${endCol}${row}`;
    sheet.getRange(subRange).merge();
    sheet.getRange(subRange).values = [[subtitle]];
    sheet.getRange(subRange).format = {
      fill: "#233650",
      font: { color: "#D8E2F0", size: 10 },
      verticalAlignment: "center",
    };
    sheet.getRange(subRange).format.rowHeight = 24;
  }
}

function header(sheet, range) {
  sheet.getRange(range).format = {
    fill: navy,
    font: { bold: true, color: white },
    wrapText: true,
    verticalAlignment: "center",
    borders: { preset: "inside", style: "thin", color: "#41536C" },
  };
  sheet.getRange(range).format.rowHeight = 34;
}

function section(sheet, range, text) {
  sheet.getRange(range).merge();
  sheet.getRange(range).values = [[text]];
  sheet.getRange(range).format = {
    fill: paleBlue,
    font: { bold: true, color: navy, size: 12 },
    verticalAlignment: "center",
  };
  sheet.getRange(range).format.rowHeight = 25;
}

function addTable(sheet, range, name) {
  const table = sheet.tables.add(range, true, name);
  table.style = "TableStyleMedium2";
  table.showFilterButton = true;
  return table;
}

function setWidths(sheet, widths) {
  for (const [col, width] of Object.entries(widths)) {
    sheet.getRange(`${col}:${col}`).format.columnWidth = width;
  }
}

for (const sheet of [dashboard, candidates, competitors, reviews, briefs, queue, capacity, website, sources]) {
  sheet.showGridLines = false;
}

// Capacity & Rules
title(capacity, "A1:J1", "产能、漏斗与评分规则", "黄色单元格为可编辑假设；公式会自动计算周产能与 1000 App 所需资源");
section(capacity, "A3:B3", "周漏斗与产能假设");
capacity.getRange("A4:B15").values = [
  ["本周扫描记录", 100000],
  ["机器初筛", 1000],
  ["竞品簇", 200],
  ["证据包", 50],
  ["深度分析", 20],
  ["主选", 5],
  ["备选", 3],
  ["操作者", 1],
  ["每人开发台", 5],
  ["每台每周 RC", 1],
  ["每年有效生产周", 46],
  ["目标 App 数量", 1000],
];
capacity.getRange("A4:A15").format.font = { bold: true, color: navy };
capacity.getRange("B4:B15").format = { fill: paleYellow, font: { color: "#7A4E00" } };
capacity.getRange("B4:B15").format.numberFormat = "#,##0";

section(capacity, "A17:B17", "公式产能");
capacity.getRange("A18:A23").values = [
  ["总开发台"],
  ["每周 RC"],
  ["每年 RC"],
  ["完成目标所需年数"],
  ["一年完成目标所需开发台"],
  ["一年完成目标所需操作者"],
];
capacity.getRange("B18:B23").formulas = [
  ["='Capacity & Rules'!B11*'Capacity & Rules'!B12"],
  ["='Capacity & Rules'!B18*'Capacity & Rules'!B13"],
  ["='Capacity & Rules'!B19*'Capacity & Rules'!B14"],
  ["=IF('Capacity & Rules'!B20=0,\"\",'Capacity & Rules'!B15/'Capacity & Rules'!B20)"],
  ["=ROUNDUP('Capacity & Rules'!B15/('Capacity & Rules'!B14*'Capacity & Rules'!B13),0)"],
  ["=ROUNDUP('Capacity & Rules'!B22/'Capacity & Rules'!B12,0)"],
];
capacity.getRange("A18:A23").format.font = { bold: true, color: navy };
capacity.getRange("B18:B23").format = { fill: paleGreen, font: { bold: true, color: "#126B35" } };
capacity.getRange("B18:B20").format.numberFormat = "#,##0";
capacity.getRange("B21").format.numberFormat = "0.00";
capacity.getRange("B22:B23").format.numberFormat = "#,##0";

section(capacity, "D3:F3", "通用评分规则");
capacity.getRange("D4:F12").values = [
  ["维度", "权重", "证据"],
  ["已验证需求", 20, "下载、MAU、评论量、搜索量"],
  ["增长质量", 15, "3/6/12 月下载、MAU、收入"],
  ["长期耐用", 10, "24–37 月稳定性、持续更新"],
  ["使用与留存", 10, "Stickiness、D1/D7/D30、Session"],
  ["商业化", 10, "收入、RPD、ARPDAU、订阅/IAP"],
  ["痛点机会", 15, "跨竞品高频痛点、未解决需求"],
  ["竞品参考质量", 10, "直接竞品、数据完整度、可学习机制"],
  ["AI / 工厂复用", 5, "核心任务改善、共享模块"],
];
capacity.getRange("D13:F13").values = [["获客可解释性", 5, "关键词、素材、渠道、自然/付费"]];
header(capacity, "D4:F4");
capacity.getRange("E5:E13").format.numberFormat = "0";
capacity.getRange("D4:F13").format.wrapText = true;

section(capacity, "H3:J3", "门槛与枚举");
capacity.getRange("H4:I8").values = [
  ["总分门槛", 75],
  ["数据完整度门槛", 0.8],
  ["直接竞品门槛", 3],
  ["主选数量", 5],
  ["备选数量", 3],
];
capacity.getRange("H4:H8").format.font = { bold: true, color: navy };
capacity.getRange("I4:I8").format = { fill: paleYellow, font: { color: "#7A4E00" } };
capacity.getRange("I5").format.numberFormat = "0%";
capacity.getRange("H10:H17").values = [
  ["Decision"],
  ["SELECTED"],
  ["BACKUP"],
  ["WATCH"],
  ["REJECTED"],
  ["BUILDING"],
  ["RC"],
  ["RELEASED"],
];
capacity.getRange("I10:I16").values = [
  ["Health"],
  ["GREEN"],
  ["YELLOW"],
  ["RED"],
  ["READY_QA"],
  ["RC"],
  ["STOPPED"],
];
header(capacity, "H10:I10");
setWidths(capacity, { A: 25, B: 14, C: 3, D: 20, E: 10, F: 42, G: 3, H: 24, I: 16, J: 12 });
capacity.freezePanes.freezeRows(2);

// Weekly Candidates
title(candidates, "A1:W1", "每周候选池", "输入竞品与市场数据；总分、证据数量和门禁自动计算");
const candidateHeaders = [
  "Week", "Candidate ID", "工作名", "品类", "类型", "目标市场", "直接竞品数", "数据完整度",
  "需求 20", "增长 15", "耐用 10", "使用留存 10", "商业化 10", "痛点 15", "竞品参考 10",
  "AI/复用 5", "获客 5", "总分", "证据行数", "Gate", "Decision", "Bench", "主来源 URL",
];
candidates.getRange("A4:W4").values = [candidateHeaders];
const candidateRows = Array.from({ length: 50 }, () => Array(23).fill(null));
candidates.getRange("A5:W54").values = candidateRows;
const totalFormulas = [];
const evidenceFormulas = [];
const gateFormulas = [];
for (let row = 5; row <= 54; row++) {
  totalFormulas.push([`=IF(B${row}="","",SUM(I${row}:Q${row}))`]);
  evidenceFormulas.push([`=IF(B${row}="","",COUNTIF('Competitor Evidence'!$A$5:$A$204,B${row}))`]);
  gateFormulas.push([`=IF(B${row}="","",IF(AND(H${row}>='Capacity & Rules'!$I$5,G${row}>='Capacity & Rules'!$I$6,R${row}>='Capacity & Rules'!$I$4),"PASS","HOLD"))`]);
}
candidates.getRange("R5:R54").formulas = totalFormulas;
candidates.getRange("S5:S54").formulas = evidenceFormulas;
candidates.getRange("T5:T54").formulas = gateFormulas;
header(candidates, "A4:W4");
addTable(candidates, "A4:W54", "WeeklyCandidatesTable");
candidates.getRange("H5:H54").format.numberFormat = "0%";
candidates.getRange("I5:R54").format.numberFormat = "0";
candidates.getRange("A5:Q54").format.fill = "#FFFDF4";
candidates.getRange("R5:T54").format.fill = paleGreen;
candidates.getRange("U5:W54").format.fill = paleBlue;
candidates.getRange("U5:U54").dataValidation = { rule: { type: "list", formula1: "'Capacity & Rules'!$H$11:$H$17" } };
candidates.getRange("V5:V54").dataValidation = { rule: { type: "list", values: ["Bench 1", "Bench 2", "Bench 3", "Bench 4", "Bench 5"] } };
candidates.getRange("R5:R54").conditionalFormats.add("colorScale", {
  thresholds: [{ type: "min" }, { type: "percentile", value: 50 }, { type: "max" }],
  colors: [paleRed, paleYellow, paleGreen],
});
setWidths(candidates, {
  A: 11, B: 15, C: 24, D: 16, E: 13, F: 13, G: 12, H: 13,
  I: 10, J: 10, K: 10, L: 12, M: 12, N: 10, O: 13, P: 11, Q: 9,
  R: 10, S: 11, T: 10, U: 13, V: 11, W: 36,
});
candidates.freezePanes.freezeRows(4);
candidates.freezePanes.freezeColumns(3);

// Competitor Evidence
title(competitors, "A1:Y1", "Competitor Evidence Pack", "每个候选至少 3 个直接竞品；所有指标必须带来源、地区、时间和数值类型");
const competitorHeaders = [
  "Candidate ID", "角色", "竞品 App", "商店 URL", "国家", "平台", "数据源", "采集日期", "数值类型",
  "3月下载", "3月下载增长", "MAU", "MAU增长", "D1", "D7", "D30", "3月收入 USD", "收入增长",
  "评分", "评论量", "核心价值", "高频痛点", "可学习", "改进机会", "不可复制资产",
];
competitors.getRange("A4:Y4").values = [competitorHeaders];
competitors.getRange("A5:Y204").values = Array.from({ length: 200 }, () => Array(25).fill(null));
header(competitors, "A4:Y4");
addTable(competitors, "A4:Y204", "CompetitorEvidenceTable");
competitors.getRange("A5:I204").format.fill = "#FFFDF4";
competitors.getRange("J5:T204").format.fill = "#F8FBFF";
competitors.getRange("U5:Y204").format.fill = "#F4FBF9";
competitors.getRange("H5:H204").format.numberFormat = "yyyy-mm-dd";
competitors.getRange("J5:J204").format.numberFormat = "#,##0";
competitors.getRange("K5:K204").format.numberFormat = "0.0%";
competitors.getRange("L5:L204").format.numberFormat = "#,##0";
competitors.getRange("M5:P204").format.numberFormat = "0.0%";
competitors.getRange("Q5:Q204").format.numberFormat = "$#,##0";
competitors.getRange("R5:R204").format.numberFormat = "0.0%";
competitors.getRange("S5:S204").format.numberFormat = "0.0";
competitors.getRange("T5:T204").format.numberFormat = "#,##0";
competitors.getRange("B5:B204").dataValidation = { rule: { type: "list", values: ["DIRECT", "ADJACENT", "ALTERNATIVE"] } };
competitors.getRange("F5:F204").dataValidation = { rule: { type: "list", values: ["iOS", "Android", "Amazon", "Huawei", "Tencent", "Other"] } };
competitors.getRange("I5:I204").dataValidation = { rule: { type: "list", values: ["official", "estimate", "internal"] } };
setWidths(competitors, {
  A: 15, B: 12, C: 23, D: 38, E: 10, F: 11, G: 16, H: 13, I: 12,
  J: 13, K: 13, L: 13, M: 12, N: 9, O: 9, P: 9, Q: 15, R: 12, S: 9, T: 12,
  U: 28, V: 30, W: 28, X: 28, Y: 28,
});
competitors.freezePanes.freezeRows(4);
competitors.freezePanes.freezeColumns(3);

// Review Themes
title(reviews, "A1:N1", "用户评论主题", "保留评论来源和版本；以主题与摘要为主，避免把单条评论当作总体结论");
const reviewHeaders = [
  "Candidate ID", "竞品 App", "Review ID", "日期", "国家", "版本", "星级", "主题类型",
  "主题", "评论摘要", "出现频次", "强度 1-5", "来源 URL", "证据状态",
];
reviews.getRange("A4:N4").values = [reviewHeaders];
reviews.getRange("A5:N304").values = Array.from({ length: 300 }, () => Array(14).fill(null));
header(reviews, "A4:N4");
addTable(reviews, "A4:N304", "ReviewThemesTable");
reviews.getRange("A5:N304").format.fill = "#FFFDF4";
reviews.getRange("D5:D304").format.numberFormat = "yyyy-mm-dd";
reviews.getRange("G5:G304").format.numberFormat = "0";
reviews.getRange("K5:L304").format.numberFormat = "0";
reviews.getRange("H5:H304").dataValidation = { rule: { type: "list", values: ["VALUE", "PAIN", "PRICE", "ADS", "SUBSCRIPTION", "BUG", "REQUEST", "PRIVACY"] } };
reviews.getRange("N5:N304").dataValidation = { rule: { type: "list", values: ["RAW", "CLUSTERED", "VERIFIED", "DISPUTED"] } };
setWidths(reviews, { A: 15, B: 22, C: 18, D: 12, E: 9, F: 11, G: 8, H: 14, I: 22, J: 44, K: 11, L: 10, M: 38, N: 13 });
reviews.freezePanes.freezeRows(4);
reviews.freezePanes.freezeColumns(2);

// Product Briefs
title(briefs, "A1:R1", "产品说明与改进策略", "每个候选只保留 1–3 个关键改进点，并逐项对应竞品和用户证据");
const briefHeaders = [
  "Candidate ID", "产品工作名", "目标用户", "触发场景", "核心任务", "竞品验证",
  "改进点 1", "改进点 2", "改进点 3", "AI 作用", "核心流程", "V1 范围",
  "非目标", "商业化", "主指标", "继续阈值", "停止阈值", "状态",
];
briefs.getRange("A4:R4").values = [briefHeaders];
briefs.getRange("A5:R54").values = Array.from({ length: 50 }, () => Array(18).fill(null));
header(briefs, "A4:R4");
addTable(briefs, "A4:R54", "ProductBriefsTable");
briefs.getRange("A5:R54").format = { fill: "#FFFDF4", wrapText: true, verticalAlignment: "top" };
briefs.getRange("R5:R54").dataValidation = { rule: { type: "list", values: ["DRAFT", "REVIEW", "APPROVED", "LOADED", "STOPPED"] } };
setWidths(briefs, {
  A: 15, B: 23, C: 26, D: 28, E: 28, F: 32, G: 30, H: 30, I: 30,
  J: 28, K: 34, L: 32, M: 26, N: 24, O: 22, P: 22, Q: 22, R: 13,
});
briefs.freezePanes.freezeRows(4);
briefs.freezePanes.freezeColumns(2);

// Build Queue
title(queue, "A1:O1", "五开发台队列", "每台每周目标是一个通过内部 QA 的 Release Candidate；商店审核另行跟踪");
const queueHeaders = [
  "Candidate ID", "工作名", "Decision", "Bench", "装载周", "Stage", "Health", "范围摘要",
  "当前风险", "下个里程碑", "计划 RC", "实际 RC", "输出状态", "商店提交", "备注",
];
queue.getRange("A4:O4").values = [queueHeaders];
queue.getRange("A5:O54").values = Array.from({ length: 50 }, () => Array(15).fill(null));
header(queue, "A4:O4");
addTable(queue, "A4:O54", "BuildQueueTable");
queue.getRange("A5:O54").format = { fill: "#FFFDF4", wrapText: true, verticalAlignment: "top" };
queue.getRange("C5:C54").dataValidation = { rule: { type: "list", values: ["SELECTED", "BACKUP", "WATCH"] } };
queue.getRange("D5:D54").dataValidation = { rule: { type: "list", values: ["Bench 1", "Bench 2", "Bench 3", "Bench 4", "Bench 5"] } };
queue.getRange("F5:F54").dataValidation = { rule: { type: "list", values: ["LOADED", "ARCHITECTURE", "BUILD", "QA", "RC", "SUBMITTED", "RELEASED", "STOPPED"] } };
queue.getRange("G5:G54").dataValidation = { rule: { type: "list", formula1: "'Capacity & Rules'!$I$11:$I$16" } };
queue.getRange("K5:L54").format.numberFormat = "yyyy-mm-dd";
queue.getRange("G5:G54").conditionalFormats.add("containsText", { text: "GREEN", format: { fill: paleGreen, font: { color: "#126B35", bold: true } } });
queue.getRange("G5:G54").conditionalFormats.add("containsText", { text: "YELLOW", format: { fill: paleYellow, font: { color: "#7A4E00", bold: true } } });
queue.getRange("G5:G54").conditionalFormats.add("containsText", { text: "RED", format: { fill: paleRed, font: { color: "#9E1C17", bold: true } } });
setWidths(queue, { A: 15, B: 24, C: 13, D: 11, E: 11, F: 15, G: 12, H: 35, I: 30, J: 28, K: 13, L: 13, M: 16, N: 16, O: 30 });
queue.freezePanes.freezeRows(4);
queue.freezePanes.freezeColumns(2);

// Website Publish
title(website, "A1:M1", "网站发布队列", "周报告、候选详情和开发台状态的结构化发布控制");
const websiteHeaders = [
  "Publish ID", "Week", "Candidate ID", "Slug", "页面状态", "标题", "摘要",
  "证据状态", "产品说明状态", "数据新鲜度", "审批人", "发布时间", "URL",
];
website.getRange("A4:M4").values = [websiteHeaders];
website.getRange("A5:M104").values = Array.from({ length: 100 }, () => Array(13).fill(null));
header(website, "A4:M4");
addTable(website, "A4:M104", "WebsitePublishTable");
website.getRange("A5:M104").format = { fill: "#FFFDF4", wrapText: true };
website.getRange("E5:E104").dataValidation = { rule: { type: "list", values: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"] } };
website.getRange("H5:I104").dataValidation = { rule: { type: "list", values: ["MISSING", "PARTIAL", "READY"] } };
website.getRange("J5:J104").format.numberFormat = "0%";
website.getRange("L5:L104").format.numberFormat = "yyyy-mm-dd hh:mm";
setWidths(website, { A: 17, B: 11, C: 15, D: 28, E: 14, F: 28, G: 44, H: 14, I: 16, J: 13, K: 13, L: 19, M: 38 });
website.freezePanes.freezeRows(4);

// Data Sources
title(sources, "A1:L1", "数据源目录", "供应商能力来自官方资料；真实覆盖、准确度、配额和成本必须在两周 Spike 中验证");
const sourceHeaders = ["数据源", "主要用途", "指标", "平台/商店", "市场覆盖", "历史", "刷新", "接口", "当前状态", "核对日期", "官方 URL", "备注"];
sources.getRange("A4:L4").values = [sourceHeaders];
sources.getRange("A5:L11").values = [
  ["42matters", "全市场、多商店基础层", "下载估算、MAU、排名、评论、SDK、权限", "Apple/Google/Amazon/Tencent/Huawei 等", "供应商覆盖", "标准 API 30 天；历史附加", "热门日更、其他周更", "API/File Dump", "待 Spike", new Date("2026-07-25"), "https://42matters.com/our-app-and-sdk-intelligence", "适合建立全商店主数据库"],
  ["Appfigures", "下载收入、排名、评论、API", "下载、净收入、国家、日期、商店", "Apple App Store/Google Play", "按支持国家", "按方案", "日级", "API/CSV", "待 Spike", new Date("2026-07-25"), "https://docs.appfigures.com/api/reference/v2/estimates", "适合自动化候选扫描"],
  ["Similarweb", "真实使用与留存", "DAU/WAU/MAU、Session、Stickiness、D1/D7/D30、收入", "iOS/Android", "官方称 58 国", "官方称 37 个月", "按产品", "Web/API", "优先评估", new Date("2026-07-25"), "https://www.similarweb.com/corp/apps/", "判断用户是否真的在用"],
  ["Sensor Tower", "一站式市场、使用、收入和获客", "下载、收入、时长、Session、留存、关键词、评论", "Apple App Store/Google Play", "按产品", "按方案", "按产品", "Web/API", "预算充足时评估", new Date("2026-07-25"), "https://sensortower.com/blog/product-spotlight-app-performance-insights", "企业级询价"],
  ["AppMagic", "游戏和品类研究", "下载、收入、玩法、子品类、IAP、LiveOps", "Apple App Store/Google Play", "按产品", "按方案", "按产品", "Web/Export", "游戏优先评估", new Date("2026-07-25"), "https://appmagic.rocks/", "需搭配使用数据源"],
  ["AppTweak", "免费初筛和 ASO", "下载收入估算、排行、关键词、发行商", "Apple App Store/Google Play", "100+ 国家（按官方资料）", "按方案", "按产品", "Web/Export", "可立即试用", new Date("2026-07-25"), "https://www.apptweak.com/en/aso-blog/app-download-revenue-estimates", "估算用于趋势和比较"],
  ["MobileAction", "关键词、评论和广告素材", "ASO、评论、下载趋势、素材、投放网络", "Apple App Store/Google Play", "按产品", "按方案", "按产品", "Web/API", "待 Spike", new Date("2026-07-25"), "https://www.mobileaction.co/pricing/", "用于解释获客来源"],
];
header(sources, "A4:L4");
addTable(sources, "A4:L11", "DataSourcesTable");
sources.getRange("A5:L11").format = { wrapText: true, verticalAlignment: "top" };
sources.getRange("J5:J11").format.numberFormat = "yyyy-mm-dd";
setWidths(sources, { A: 17, B: 28, C: 38, D: 32, E: 21, F: 22, G: 20, H: 16, I: 18, J: 13, K: 45, L: 30 });
sources.freezePanes.freezeRows(4);

// Dashboard
title(dashboard, "A1:H1", "APP 选品与五开发台驾驶舱", "模板状态：尚未接入真实数据；本页指标由其他工作表自动汇总");
dashboard.getRange("A3:H3").values = [[
  "周扫描记录", "候选簇", "证据包", "深度分析", "主选", "备选", "周 RC 产能", "实际 RC",
]];
dashboard.getRange("A4:H4").formulas = [[
  "='Capacity & Rules'!B4",
  "='Capacity & Rules'!B6",
  "='Capacity & Rules'!B7",
  "='Capacity & Rules'!B8",
  "=COUNTIF('Weekly Candidates'!$U$5:$U$54,\"SELECTED\")",
  "=COUNTIF('Weekly Candidates'!$U$5:$U$54,\"BACKUP\")",
  "='Capacity & Rules'!B19",
  "=COUNTIF('Build Queue'!$M$5:$M$54,\"RC\")",
]];
header(dashboard, "A3:H3");
dashboard.getRange("A4:H4").format = {
  fill: paleGreen,
  font: { bold: true, color: navy, size: 16 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
dashboard.getRange("A4:H4").format.numberFormat = "#,##0";
dashboard.getRange("A4:H4").format.rowHeight = 32;

section(dashboard, "A7:B7", "计划周漏斗");
dashboard.getRange("A8:B14").values = [
  ["阶段", "数量"],
  ["扫描记录", null],
  ["机器初筛", null],
  ["竞品簇", null],
  ["证据包", null],
  ["深度分析", null],
  ["主选", null],
];
dashboard.getRange("B9:B14").formulas = [
  ["='Capacity & Rules'!B4"],
  ["='Capacity & Rules'!B5"],
  ["='Capacity & Rules'!B6"],
  ["='Capacity & Rules'!B7"],
  ["='Capacity & Rules'!B8"],
  ["='Capacity & Rules'!B9"],
];
header(dashboard, "A8:B8");
dashboard.getRange("B9:B14").format.numberFormat = "#,##0";
dashboard.getRange("A9:B14").format.fill = "#F8FBFF";

const funnelChart = dashboard.charts.add("bar", dashboard.getRange("A8:B14"));
funnelChart.title = "计划周漏斗（对数差异请查看表格）";
funnelChart.hasLegend = false;
funnelChart.xAxis = { axisType: "textAxis", textStyle: { fontSize: 10 } };
funnelChart.yAxis = { numberFormatCode: "#,##0" };
funnelChart.setPosition("D7", "H15");

section(dashboard, "A17:H17", "本周操作提示");
dashboard.getRange("A18:H22").merge(true);
dashboard.getRange("A18:A22").values = [
  ["1. 先在 Weekly Candidates 填候选和评分；竞品行会自动计数。"],
  ["2. 每个主选至少 3 个直接竞品，数据完整度至少 80%，总分至少 75。"],
  ["3. 在 Product Briefs 只保留 1–3 个改进点；在 Build Queue 分配五个开发台。"],
  ["4. 网站发布前检查 Website Publish 的证据、产品说明和数据新鲜度。"],
  ["5. 所有竞品数字都要标明 official / estimate / internal。"],
];
dashboard.getRange("A18:H22").format = {
  fill: "#F8FAFC",
  font: { color: gray },
  wrapText: true,
  verticalAlignment: "center",
};
setWidths(dashboard, { A: 18, B: 16, C: 13, D: 18, E: 18, F: 18, G: 18, H: 18 });
dashboard.freezePanes.freezeRows(2);

// Render all sheets and export.
const renderSpecs = [
  ["Dashboard", "A1:H22"],
  ["Weekly Candidates", "A1:W18"],
  ["Competitor Evidence", "A1:Y16"],
  ["Review Themes", "A1:N18"],
  ["Product Briefs", "A1:R16"],
  ["Build Queue", "A1:O18"],
  ["Capacity & Rules", "A1:J23"],
  ["Website Publish", "A1:M18"],
  ["Data Sources", "A1:L11"],
];

for (const [sheetName, range] of renderSpecs) {
  const preview = await wb.render({ sheetName, range, scale: 1, format: "png" });
  const fileName = sheetName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await fs.writeFile(`${previewDir}/${fileName}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const inspection = await wb.inspect({
  kind: "sheet,table",
  maxChars: 12000,
  tableMaxRows: 8,
  tableMaxCols: 12,
});
await fs.writeFile(`${previewDir}/inspect.ndjson`, inspection.ndjson, "utf8");

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
await fs.writeFile(`${previewDir}/formula-errors.ndjson`, errors.ndjson, "utf8");

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(`${outputDir}/APP选品周运营模板.xlsx`);
console.log(`${outputDir}/APP选品周运营模板.xlsx`);
