# Build master prompt

Read every file in this package. Freeze the scope, core change directions, and
three-perspective acceptance criteria before coding.

Objective: 在安装命令执行前生成权限、维护和风险说明，并建议最小权限配置
Stage: `MVP`
Stack: React Native / Expo, TypeScript, 本地优先存储, 事件分析适配层
Repository: create or select within the authorized workspace
Recommended skills: auto-loop, frontend-studio, vercel-react-best-practices

构建 MCP Trust Lens（MCP 信任透镜） 的可测试MVP。目标用户是准备给桌面AI或编码代理安装MCP服务器的开发者和高级用户。核心任务是在安装前理解该服务器会访问什么、维护是否活跃、已知风险和最小权限。产品承诺是在安装命令执行前生成权限、维护和风险说明，并建议最小权限配置。严格只实现资料包列出的核心改变；先冻结任务流、数据边界和验收标准，再实现、测试并检查真实界面。所有AI输出必须展示不确定性或来源；网络失败不得破坏本地核心任务。

## Required deliverables

- 可运行源代码
- 核心流程自动化测试
- 关键屏幕截图
- 事件字典
- 已知风险与下一阶段建议

## Allowed autonomy

- 可在既定范围内选择组件和库
- 可修复测试、性能和无障碍问题
- 可优化文案但不得扩大功能

## Pause conditions

- 需要付费服务或新凭据
- 需要公开部署或商店提交
- 范围变更影响产品承诺
- 涉及医疗、安全或隐私高风险决定

Run tests, inspect the actual UI, complete an improvement pass, and return source
paths, build/test evidence, screenshots, known risks, and stage status. Do not add
unapproved features or perform public deployment/store submission without authority.
