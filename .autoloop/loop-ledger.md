# Auto Loop Ledger

## Objective

交付一个可开发、可审查、可部署的“选品 + 工作派发”系统基线，正式域名为 `select.1add2.com`。

## Deliverables

- 产品契约、状态机、派发算法、数据模型。
- 自有服务器部署边界与执行器安全边界。
- 三套互斥前端视觉方向与可比较 HTML 原型。
- 角色职责、提示词和项目路线图。
- 独立 Git 仓库与首个版本提交。

## Assumptions

- 新系统使用 Postgres + Redis + 对象存储；研究任务异步执行。
- 生产域名和 Feishu Webhook 由部署环境注入，不写入 Git。
- Codex、OpenCode、Hermes 是可插拔执行器，不代表本机已经安装或已接通。

## Roles / lanes

- Planner / CEO：内部完成范围、取舍与停止条件。
- Product / COO：内部完成用户流、状态和容量规则。
- Architect / Tech：内部完成数据、队列、执行器与部署方案。
- Design：内部完成三方向设计实验。
- Verifier / QA：内部完成检查清单与发布门禁。
- Integrator / PM：统一文件、决策和 Git checkpoint。

## Validation

- Markdown、JSON、HTML 文件结构检查。
- 三套原型共用同一任务数据与主操作。
- Git 状态、提交哈希和版本文件一致。
- 生产部署仍需凭据、服务器、DNS 和真实集成回执。

## 2026-11-26 MVP execution loop

### Roster

- Planner / 产品架构：`.autoloop/planner-audit.md`，盘点现状、明早范围和验收清单。
- Backend Builder / 技术经理：`.autoloop/backend-handoff.md`，任务幂等、租约、心跳、回收、审计和状态 API。
- Frontend QA / 设计与测试：`.autoloop/frontend-qa-handoff.md`，任务板状态筛选、错误恢复和页面冒烟。
- Integrator / 老大：合并两条实现线，补 YouTube 证据模型、展示、Worker 完成门禁和水合修复。

### Delivered

- 任务请求支持幂等键、完整生命周期、审计事件、原子领取、15 分钟租约、心跳续租和过期回收。
- 启动器任务板支持 queued、claimed、processing、review、completed、blocked、failed、cancelled，并显示错误与报告入口。
- 候选增加 `youtubeEvidence`，支持 found / insufficient_data，报告详情和候选总表展示具体视频或可复核缺口。
- Worker 在写入报告前校验每个候选的 YouTube 检索回执，完成状态必须带报告回执。
- 修复 AppShell 与制作档案的日期跨时区水合错误。
- 制作档案列表增加加载、错误、重试和卸载保护，远程图片补充尺寸与懒加载。
- 任务队列增加并发幂等冲突复用、显式状态转换表、租约匹配校验和非法 limit 兜底。
- 主导航补齐调查报告与开发排期入口，启动器提交带稳定幂等键，失败/阻塞任务支持重新排队，并显示执行器、更新时间和租约时间。
- 补齐 MIT、贡献指南、安全策略和 GitHub Actions CI，准备公开仓库。

### Validation evidence

- `cd apps/selection-web && npm test`：14/14 通过，生产构建通过。
- `cd apps/selection-web && npm run lint`：0 errors，3 个既有 warning。
- `node --check apps/selection-web/scripts/selection-worker.mjs`：通过。
- `git diff --check`：通过。
- 本地浏览器冒烟：`/selector`、`/candidates`、`/reports` 返回 200，任务板状态筛选可用，候选与报告页面出现 YouTube 证据区块，水合错误复测消失。
- 本地 D1 API 冒烟：同一幂等键重复 POST 返回同一任务且第二次 `reused=true`；两个并发 claim 只有一个返回任务，另一个返回空队列。
- 自主优化后 `npm test`：15/15，通过；`npm run lint`：0 warning、0 error。
- 自主优化后 `npm test`：16/16，通过；`npm run lint`：0 warning、0 error。
- 本地 API 回归：任务经历 `claimed → processing → failed → queued` 后可复用原幂等键，未产生重复任务。

### Remaining boundary

- OIDC、角色权限、Postgres/Redis、常驻 Worker、Docker、备份监控和生产 Feishu/DNS 仍需外部配置与发布门禁，当前交付定位为明早可用的本地 Demo/MVP 闭环。

### Open-source delivery

- Public repository: `https://github.com/ElevenZhou/manfen-selection-workbench`
- Main commit: `b92bde9` (`feat: harden selection workbench for open source`)
- GitHub Actions CI: passed for `main` in run `45683590857`.
- Repository topics: `app-selection`, `product-research`, `nextjs`, `cloudflare`, `feishu`, `youtube-evidence`.
