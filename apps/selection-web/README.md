# APP 选品驾驶舱

> 该目录是旧站点封板版的迁移基线，已纳入[满分选品工作台主项目](../../README.md)。新功能开发、账号派发和容量控制请回到项目根目录的产品契约与任务台账。

统一保存并按时间展示三条路线的选品报告、选品总表、工作台资料包与开发排期。

## 线上环境

- 正式地址：<https://select.1add2.com>
- 封板版本：`v1.0.0`（2026-11-24）
- 托管平台：ChatGPT / Codex Sites
- 数据存储：Sites 管理的 D1
- 访问模式：`public`
- 阅读权限：无需登录 ChatGPT，任何拿到链接的人都可以浏览

公开访问仅用于阅读。报告入库、飞书推送和其他会改变外部状态的操作仍需服务端校验，不得把凭证放进前端。

## 当前页面

- `/`：驾驶舱与最新一期概览
- `/reports`：历史选品报告
- `/reports/[id]`：单份报告详情
- `/candidates`：跨报告选品总表与筛选
- `/packages`：生产资料包
- `/schedule`：开发排期
- `/ingest`：报告入库
- `/api/reports`：报告读取与写入接口

## 视觉与视频证据

候选展示需要优先呈现可追溯的产品图标、参考产品图标和商店样图。选品完成后，每个候选都要有 YouTube 关联视频检索回执。找到的视频以具体视频页面链接挂到候选详情、报告详情和制作档案；没有找到时显示 `insufficient_data` 的检索范围与限制。

开工提示词必须要求执行 YouTube 检索，并把视频证据、图标/样图来源和缺口带入后续制作。缺少检索回执的候选不能进入完整开工包。

## 数据与发布原则

- 同一个网站持续新增报告，不为每次运行创建新站点。
- D1 中的报告不可静默覆盖；修订使用新的报告版本。
- 网站不重算三条路线的评分和排名。
- 公开内容必须经过清理，不得包含 Webhook、Token、Cookie、供应商密钥、付费数据原件、个人隐私或本机绝对路径。
- 允许公开的资料包才可以生成线上下载地址。

## 本地开发

要求 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
npm run build
```

常用命令：

- `npm run dev`：启动本地开发环境
- `npm run build`：验证生产构建
- `npm test`：运行项目测试
- `npm run db:generate`：数据库结构变化后生成 D1 migration

本地闭环可在一个终端启动网站，在另一个终端手动运行 Worker：

```bash
npm run dev
SELECTION_SITE_URL=http://localhost:3000 SELECTION_PROJECT_ROOT="$(cd ../.. && pwd)" node scripts/selection-worker.mjs
```

Worker 会领取一个排队任务，续租执行中的任务，写入报告和回执，并在证据门禁通过后更新为 `completed`。

## 配置

`.openai/hosting.json` 只保存 Sites 项目标识和逻辑 D1/R2 绑定。Webhook 与其他运行密钥通过 Sites 环境变量管理，不进入 Git。

本地变量参考 `.env.example`，不得在 README、报告、资料包、日志或提交记录中填写真实密钥。

## 相关规范

- `../docs/05-选品网站产品与数据规格.md`
- `../docs/11-统一网站总控边界与资料包说明.md`
- `../docs/12-联网大模型现查研究协议与运行产物规范.md`
- `../docs/13-飞书选品报告发布规范.md`
- `../docs/14-产品形态与参考对象分类规范.md`
