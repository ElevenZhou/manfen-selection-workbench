import { readFile, writeFile } from "node:fs/promises";

const runDir = new URL("./", import.meta.url);
const payload = JSON.parse(await readFile(new URL("website-report.json", runDir), "utf8"));
const siteUrl = "https://app-selection-hub.xiaojie-april.chatgpt.site";
const kinds = {
  open_source_project: "开源项目",
  web_product: "Web 产品",
};
const forms = {
  web_app: "Web 应用",
  cross_platform: "跨端应用",
};
const routeMeta = {
  A: ["🔵", "开源底座"],
  B: ["🟠", "免费商业验证工具"],
};
const watch = payload.candidates
  .filter((candidate) => candidate.decision === "ROUTE_WATCH")
  .sort((left, right) => left.route.localeCompare(right.route) || left.routeRank - right.routeRank);

const elements = [
  {
    tag: "div",
    text: {
      tag: "lark_md",
      content:
        `**🗓️ ${payload.report.periodLabel}**\n` +
        `🔎 **${watch.length}** 个深度研究　·　⏸️ **0** 个正式入选\n` +
        payload.report.summary,
    },
  },
  { tag: "hr" },
];

for (const route of ["A", "B"]) {
  const candidates = watch.filter((candidate) => candidate.route === route);
  const [icon, title] = routeMeta[route];
  const lines = [`**${icon} ${route} · ${title}（${candidates.length}）**`];
  for (const candidate of candidates) {
    const references = candidate.references.map((reference) =>
      `[${reference.name}（${reference.nameZh}） · ${kinds[reference.kind]}](${reference.storeUrl ?? reference.url})`
    ).join(" · ");
    lines.push(
      `\n**${candidate.routeRank}. ${candidate.title}（${candidate.titleZh}）**　` +
      `\`${forms[candidate.productForm]}\`　\`${candidate.routeScore}分\`\n` +
      `参考：${references}\n状态：WATCH，完成报告列出的验证门槛前不进入开发台`
    );
  }
  elements.push({ tag: "div", text: { tag: "lark_md", content: lines.join("\n") } });
  elements.push({ tag: "hr" });
}

elements.push(
  {
    tag: "note",
    elements: [{
      tag: "plain_text",
      content: "本卡为调查结果，不代表正式立项；完成报告列出的数据、权限、使用或技术验证后再决定是否入选。",
    }],
  },
  {
    tag: "action",
    actions: [{
      tag: "button",
      text: { tag: "plain_text", content: "查看完整选品报告" },
      type: "primary",
      url: `${siteUrl}/reports/${payload.report.id}`,
    }],
  },
);

const card = {
  msg_type: "interactive",
  card: {
    config: { wide_screen_mode: true, enable_forward: true },
    header: {
      template: "blue",
      title: { tag: "plain_text", content: `📊 ${payload.report.title}` },
    },
    elements,
  },
};

await writeFile(new URL("feishu-card.json", runDir), `${JSON.stringify(card, null, 2)}\n`);
