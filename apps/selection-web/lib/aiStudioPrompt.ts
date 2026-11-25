import type { CandidateArchiveEntry, ProjectConcept } from "./types";

export function buildDefaultConcepts(candidate: CandidateArchiveEntry): ProjectConcept[] {
  const subject = candidate.titleZh || candidate.title;
  return [
    { id: "A", name: `${subject} · Neon Pulse`, theme: "高饱和霓虹科技动感", visual: "深色背景、青紫粉渐变、发光轨道、强对比反馈", innovation: "用更清晰的核心反馈和短局连击强化即时爽感", painPoint: candidate.improvements[0] || "减少误触并提升反馈清晰度" },
    { id: "B", name: `${subject} · Story Current`, theme: "主题故事与逐层解锁", visual: "章节化场景、环境光变化、轻叙事界面", innovation: "让每次核心操作推进一个可感知的故事目标", painPoint: candidate.improvements[1] || candidate.improvements[0] || "降低重复感并增加长期动力" },
    { id: "C", name: `${subject} · Master Circuit`, theme: "高手挑战与极限关卡", visual: "高密度能量界面、计时压力、强烈粒子特效", innovation: "增加可学习的高难挑战和可复盘的失败反馈", painPoint: candidate.improvements[2] || candidate.improvements[0] || "让难度递进更公平且更有挑战" },
  ];
}

export function buildAiStudioPrompt(candidate: CandidateArchiveEntry) {
  const references = candidate.references.map((reference) => {
    const store = reference.storeUrl ? `商店：${reference.storeUrl}` : "商店链接：暂无";
    return `- ${reference.name}（${reference.nameZh}）\n  类型：${reference.kind} / ${reference.relation}\n  资料：${reference.url}\n  ${store}`;
  }).join("\n");
  const improvements = candidate.improvements.map((item) => `- ${item}`).join("\n");
  return `你是一个能够自主研究、定义、设计、实现、调试和打磨产品的高级产品开发伙伴。

【项目身份】
- 选品项目：${candidate.title}（${candidate.titleZh}）
- 产品形态：${candidate.productForm}
- 品类：${candidate.category}
- 目标市场：${candidate.market}
- 选品路线：${candidate.route}，路线分 ${candidate.routeScore}
- 选品机会：${candidate.opportunity}

【参考产品和研究入口】
${references}

先自主研究商店页面、官网、视频、截图、评分、近期评论、社区讨论、公开技术资料和在合法授权范围内可检查的 APK 或代码。先建立对核心玩法、用户任务、操作反馈、内容结构、难度曲线、生命周期、商业化和用户痛点的理解。区分已确认事实、推断和待验证假设，资料无法访问时说明缺口。

【制作目标】
- 还原参考产品最有价值的核心玩法、操作节奏和即时反馈。
- 用原创品牌、主题、故事、视觉、声音、内容和文案重新表达。
- 只加入少量服务于核心体验的微创新。
- 优先解决以下选品中已经识别的用户痛点：
${improvements}
- 核心玩法必须突出，用户应快速进入第一次有价值体验。

【设计和质量要求：第一条回复必须出图】
- 研究完成后，第一条可见回复必须同时给出 3 套明显不同的名称、主题、故事、视觉风格、声音方向、微创新和长期体验方案，并实际生成每套方案的设定图。禁止先只给文字、ASCII 草图、图片提示词或“稍后生成图片”。
- 这 3 套方案必须使用当前可用的最高质量图像生成/设计能力，实际制作每套方案的主视觉板、核心玩法/场景图和关键页面图；移动产品至少 3 张关键页面，游戏至少 3 个关键场景。
- 为每张图保存结构化图像提示词、模型/模式、生成时间和待验证项，并将 PNG/JPG、研究文档、文字方案和选择记录归档到项目根目录的 artifacts/design-directions/<project-id>；代码、构建包、截图和测试记录也必须落到该项目 artifacts/目录，不能只留在聊天或临时目录。图片中的 UI 文字若不可控，使用后期排版或标注稿修正。
- 用统一图文选择卡并排展示 A/B/C，明确要求操作员回复 A、B 或 C；没有真实图像产物时标记 DESIGN_IMAGE_BLOCKED，暂停完整编码，不得自行选择。
- 在进入编码前，先根据游戏类型、目标平台、画面复杂度、物理/3D 需求和交付环境推荐最终技术方案，至少说明引擎/框架、语言、渲染、资源管线、存档、测试和构建方式，并给出一个备选及取舍理由。2D 休闲益智默认评估 Godot + GDScript；2D/2.5D 物理和商业 SDK 默认评估 Unity + C#；3D 重物理默认评估 Unity + C#（仅高端画面考虑 Unreal）；H5 默认评估 Phaser + TypeScript；纯界面/卡牌/经营默认评估 React + TypeScript 或 Flutter + Dart。
- 选定后定义最终产品目标、架构图、模块边界、内容结构、生命长度和难度曲线。
- 第一版要体现高完成度，包含核心循环、主题视觉、关键动效、声音占位、内容节奏、失败恢复和基本进度。
- 预留激励视频、插屏广告、更多游戏、排行榜、轻社交、统计和远程配置接口。
- 细节、特效、触控反馈、声音、动效和商业化位置必须服务于体验，不要堆砌系统。
- 可以自主决定技术栈、代码结构、算法和实现细节。

不得复制参考产品的品牌、Logo、截图、文案、音乐、代码、关卡、角色或其他受保护资产。不得绕过加密、访问控制、付费墙或技术保护。

完成后实际运行和验证关键流程，并输出最终名称、目标、主题、设计、核心玩法、微创新、痛点优化、架构图、生命长度、难度设计、商业化接口、构建方式、产物路径、实际验证结果和未完成项。`;
}
