# 满分选品工作台

满分选品工作台把“发现机会”与“把机会分派给可执行的人”放进同一个受控工作流。它继承现有选品系统的证据、路线和报告规范，新增账号、任务队列、人员配置、容量控制、认领、审计和结果回流。

项目目录：`/Users/xmm/projects/满分选品系统`

正式域名：<https://select.1add2.com>

当前版本：`0.1.0`（立项与设计基线）

资料迁移状态：已完成。旧选品系统的可安全复用资料已经迁移到本项目；以后开发、文档和运行记录统一以本目录为入口。

## 当前阶段

`EARLY / MVP 设计冻结前`。本仓库已经完成产品契约、任务状态机、容量算法、部署方案、提示词库和三套视觉方向；尚未宣称生产部署或正式域名已切换。

## 产品边界

- 所有已登录账号都可以发起选品任务。
- 任务先进入统一队列；系统根据人员配置、技能标签、可用性和并发容量自动分派。
- 未自动分派的任务可以被合资格人员主动认领；主动认领最多获得本人基础容量之外的 2 个额外并发额度。
- 系统级同时进行量永远不超过所有启用人员的基础容量之和，加上已配置的认领额外额度。
- `queued`、`claimed`、`processing`、`review`、`completed`、`blocked`、`cancelled` 是不同事实状态，不能以排队或领取替代完成证据。
- 选品报告、候选、资料包、Feishu 卡片和执行回执都保留版本与幂等键。

## 资料导航

- [项目简报](project-brief.md)
- [产品契约与验收](docs/00-product-contract.md)
- [系统架构](docs/01-architecture.md)
- [派发与容量规则](docs/02-dispatch-rules.md)
- [数据模型](docs/03-data-model.md)
- [三套前端视觉方向](docs/04-frontend-direction-lab.md)
- [服务器与部署方案](docs/05-deployment.md)
- [域名与飞书](docs/06-domain-and-feishu.md)
- [提示词与角色](docs/07-prompts-and-roles.md)
- [路线图](docs/08-roadmap.md)
- [质量与发布门禁](docs/09-quality-release-gates.md)
- [参考标的分析](docs/10-reference-benchmark.md)
- [新版本架构图](docs/architecture-v2.svg)
- [高保真设计图](design/generated/2026-11-25-obsidian-instrument-v1.png)
- [资料迁移清单](MIGRATION.md)
- [旧选品系统源代码](apps/selection-web/)
- [旧系统完整资料归档](legacy/APP选品系统/)
- [决策记录](decisions/0001-system-boundary.md)
- [岗位提示词](prompts/)
- [设计对比入口](design/index.html)

## 开发方式

```bash
cd /Users/xmm/projects/满分选品系统
cp .env.example .env.local
git status
```

当前 Web 基线位于 `apps/selection-web/`。它来自旧站点封板提交 `dbf8e80` / `v1.0.0`，保留现有报告、候选、资料包、Feishu 和筛选能力；新系统的账号、派发、容量和研究执行器将围绕这个基线逐步重构。

生产系统建议使用 Docker Compose 运行 Web/API、队列、数据库、对象存储、研究适配器和执行器。Codex、OpenCode、Hermes 只通过受控执行器接入，不能从浏览器请求直接启动。

## 外部状态说明

本地 Git 已初始化，当前没有绑定远程仓库。正式服务器、DNS、Feishu 生产 Webhook 和 Git 远程地址属于外部配置，必须在凭据就绪后按文档的 canary、健康检查和回滚门禁执行。
