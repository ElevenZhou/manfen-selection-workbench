"use client";
import { AppShell } from "../components/AppShell";
import { marketingAssetsPrompt } from "./marketingAssetsPrompt";
import { additionalAssetPrompts } from "./additionalAssetPrompts";

type PromptGroup = {
  tag: string;
  tone: string;
  title: string;
  use: string;
  prompt: string;
  fullPrompt?: string;
};

const promptGroups: PromptGroup[] = [
  { tag: "美术优化", tone: "pink", title: "把功能界面打磨成可用的视觉系统", use: "首版完成后，视觉廉价、层级混乱或反馈不够明确时使用。", prompt: "请对当前产品做一次美术与视觉质量升级。保留核心玩法和信息架构，先检查构图、层级、颜色、字体、材质、动效、触控反馈和空/错/加载状态，再按影响体验的顺序修改。每次修改说明问题、依据和验证结果；不要只换颜色，不要引入无关装饰。" },
  { tag: "APK 打包", tone: "blue", title: "用 action 自动打包并留下可下载产物", use: "需要稳定生成 APK/AAB、版本号和构建回执时使用。", prompt: "请为当前项目配置可重复执行的 GitHub Actions 打包流程。检查依赖、签名配置、版本号、构建变体和产物命名；先完成 debug APK，再按已提供的安全凭据生成 release 产物。上传 APK/AAB、构建日志、commit SHA、时间和失败原因，不要把密钥写入仓库或日志。" },
  { tag: "关卡难度", tone: "orange", title: "让难度递进公平，并能解释为什么", use: "益智、休闲、动作和关卡型产品进入内容扩展时使用。", prompt: "请重新审查关卡/内容难度曲线。用学习、练习、变式、压力、掌握五段说明节奏；标出每关新增变量、预期失败点、首次成功时间和重试成本。实际试玩关键节点，修复无提示的突增难度，并输出调整前后对照和验证记录。" },
  { tag: "SDK 接入", tone: "green", title: "接入 SDK 但不破坏首屏和核心闭环", use: "广告、分析、推送、登录、支付或远程配置接入时使用。", prompt: "请以最小可逆方式接入所需 SDK。先列出权限、隐私、初始化时机、离线失败、超时、测试开关和移除方案；核心流程必须在 SDK 不可用时继续运行。使用环境变量和测试凭据，禁止把生产密钥写入客户端、仓库或日志，完成真机验证后再报告接入状态。" },
  { tag: "体验验收", tone: "purple", title: "从用户、项目和增长三种视角做验收", use: "准备交给操作员、开发台或发布前复核时使用。", prompt: "请完成一次三视角验收：用户视角检查首次价值、操作准确性、反馈和错误恢复；项目视角检查范围、构建、依赖、数据和回滚；增长视角检查留存触发、分享、商业化位置和停止条件。只报告实际运行验证过的结果，并按严重程度列出未完成项。" },
  { tag: "游戏复刻并行模板", tone: "orange", title: "第一轮直接出设定图，再选主题和技术栈", use: "来自 game-clone-kickoff；适合快速验证手机游戏核心玩法，和制作档案模板并列使用。", prompt: "先研究参考游戏的核心规则、操作、节奏、商店截图和实玩视频，标记事实、推断和待验证项。第一条可见回复必须实际生成 3 套可并排比较的美术设定图和 3 个原创名字，不能只给文字或图片提示词；等待操作员选择 A/B/C 后才编码。所有研究文档、设定图、提示词、选择记录、代码、构建包和测试结果都必须保存到项目 artifacts/ 目录。根据游戏类型、平台、画面和物理需求先推荐最终引擎、语言、渲染、存档、测试和构建方案，并给出备选及取舍。第二轮用于试玩修复，第三轮用于上架打磨。保持玩法接近参考品，美术、名称和文案全部原创。" },
  { tag: "游戏上架整包", tone: "pink", title: "从游戏完成到商店发布的素材与增长样板", use: "基础模板：统一完成品牌资产、商店素材、信息流创意、短视频和上架检查。", prompt: "请把当前游戏准备到可以上架和投放测试的状态，并先输出资产清单、规格、文案和验收标准，再制作。\n\n一、统一品牌：建立工作室统一标识系统，包含 studio Logo、字标、色彩和安全区；为本游戏设计原创游戏 Logo、应用图标、启动图、开屏、设置页、关于页和版权/隐私入口。所有资产保持同一品牌系统，导出 SVG/PNG 多尺寸版本，记录字体、颜色、留白和不可用场景。\n\n二、商店商品页：准备英文主标题、副标题、短描述、长描述、关键词、版本更新说明、隐私与数据安全说明、客服入口；制作图标、Feature Graphic、手机竖屏展示图至少 8 张，并为每张图写真实画面说明，不用夸大承诺。\n\n三、社交与投放素材：为 Facebook 和 TikTok 各生成 2 张封面图，分别测试玩法冲突、结果爽感、主题世界和用户痛点。再做 20 套信息流图文创意，每套包含不同视角的标题、主文案、画面构图、CTA、目标人群、假设和测试指标；20 套不得只是换颜色。\n\n四、视频：制作 2 段 10 秒竖屏视频，一段展示核心操作到结果，一段展示失败/反转到成功；输出分镜、画面、字幕、音效、节奏、首 2 秒钩子、结尾 CTA 和可替换版本。视频和图片都只使用已授权或原创资产。\n\n五、上架准备：检查包名、版本号、签名、启动图、权限、崩溃、离线、隐私、广告/支付占位、商店截图尺寸、文案长度、年龄分级、目标国家、本地化和客服链接。用真机完成安装、首次启动、核心玩法、暂停、失败恢复、返回、分享和升级测试；输出缺陷清单、截图、构建 SHA、APK/AAB 路径和发布前阻塞项。未经确认不要提交商店或开启付费投放。" },
  { tag: "GitHub Actions APK", tone: "blue", title: "Android 自动测试、打包与双渠道发布", use: "已验证模板：测试通过后生成 Debug APK；配置 Secrets 后再生成 Release APK，并同步 Actions Artifacts 与 Releases。", prompt: "请为当前 Android 项目配置 .github/workflows/build-apk.yml，并写入 doc/github-actions-apk-guide.md。先检查 Gradle wrapper 版本、gradlew、compileSdk/targetSdk 和 Robolectric @Config；使用 ubuntu-24.04、Java 21、gradle/actions/setup-gradle@v6，并按仓库实际情况调用 gradlew 或 gradle。固定使用 checkout@v7、setup-java@v5、setup-android@v4、setup-gradle@v6、upload-artifact@v7、softprops/action-gh-release@v3，声明 permissions: contents: write。构建前处理 debug.keystore.base64 或生成 debug.keystore、缺失 .env、接受 SDK licenses。支持 main/master、v* 标签、pull_request 和 workflow_dispatch；先 testDebugUnitTest，再 assembleDebug。只有三个签名 Secrets 都存在时才 assembleRelease；APK 统一放入 dist/，Artifacts 保留 30 天，v* 发布正式 Release，main/master 更新 latest-apk。完成后检查 YAML，并说明触发方式、下载位置和 Secrets 配置。" },
  { tag: "营销资产整包", tone: "purple", title: "扫描真实项目，生成游戏官网与全套上架素材", use: "从项目代码、美术、配置和截图出发，生成可提交 Git 的文案、20 套图文、游戏官网和 4–6 套视频方案。", prompt: "扫描真实项目，先列真实素材，再按文案、官网、20 套图文和视频方案逐步生成。所有产物写入 _marketing_assets/，引用真实路径并完成语法、尺寸、dry-run 和 Git 可提交性检查。", fullPrompt: marketingAssetsPrompt },
  ...additionalAssetPrompts,
];
export default function PromptsPage() { return <AppShell active="prompts"><section className="prompt-library-hero"><span className="project-kicker"><span className="pulse-ring" /> REUSABLE PROMPT LIBRARY</span><h1>经验提示词<br /><em>拿来即用</em></h1><p>把已经验证过的做法按场景归档。制作档案负责项目上下文，提示词库负责通用动作。</p></section><section className="prompt-library-grid">{promptGroups.map(item => <article className={`prompt-library-card ${item.tone}`} key={item.tag}><div className="prompt-library-meta"><span>{item.tag}</span><small>可复用</small></div><h2>{item.title}</h2><p>{item.use}</p><pre>{item.prompt}</pre>{item.fullPrompt ? <details className="prompt-full"><summary>查看完整样板提示词</summary><pre>{item.fullPrompt}</pre></details> : null}<button onClick={() => navigator.clipboard.writeText(item.fullPrompt ?? item.prompt)}>{item.fullPrompt ? "复制完整提示词" : "复制提示词"}</button></article>)}</section></AppShell>; }
