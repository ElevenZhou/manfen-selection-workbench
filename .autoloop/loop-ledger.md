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
