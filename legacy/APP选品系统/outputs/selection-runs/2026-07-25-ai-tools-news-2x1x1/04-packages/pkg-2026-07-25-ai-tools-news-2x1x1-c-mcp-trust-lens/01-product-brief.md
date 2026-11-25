# Product brief

## Objective

- 产品形态：Web 应用
- Target markets: Global
- Target platforms: Web
- Target user: 准备给桌面AI或编码代理安装MCP服务器的开发者和高级用户
- Trigger: 复制一条MCP安装命令、授权文件系统或连接外部账户
- Core job: 在安装前理解该服务器会访问什么、维护是否活跃、已知风险和最小权限
- Current alternative: 阅读README、手工审代码、社区推荐和直接试装
- Product promise: 在安装命令执行前生成权限、维护和风险说明，并建议最小权限配置
- Minimum success: 5–8名目标用户中至少70%独立完成核心任务，且核心结果优于现有替代。

## Core change directions

### 1. 解析安装配置、工具声明和依赖，生成普通人可读的权限差异

- User evidence: 参考组与公开用户证据共同指向：阅读README、手工审代码、社区推荐和直接试装尚未稳定解决该结果。
- Current failure: 阅读README、手工审代码、社区推荐和直接试装
- Change: 解析安装配置、工具声明和依赖，生成普通人可读的权限差异
- Expected outcome: 减少核心任务的步骤、等待、误触或不确定性，并能在最小版本中直接测量。
- Validation metric: 任务完成率、完成时间、错误/退出率及目标用户主观可信度。
- Out of scope: 不扩展为全能平台，不复制竞品品牌、内容、关卡、代码或受保护资产。
### 2. 结合维护活跃、漏洞与来源信号给出隔离运行建议，不自动安装

- User evidence: 参考组与公开用户证据共同指向：阅读README、手工审代码、社区推荐和直接试装尚未稳定解决该结果。
- Current failure: 阅读README、手工审代码、社区推荐和直接试装
- Change: 结合维护活跃、漏洞与来源信号给出隔离运行建议，不自动安装
- Expected outcome: 减少核心任务的步骤、等待、误触或不确定性，并能在最小版本中直接测量。
- Validation metric: 任务完成率、完成时间、错误/退出率及目标用户主观可信度。
- Out of scope: 不扩展为全能平台，不复制竞品品牌、内容、关卡、代码或受保护资产。

## Scope

- 解析安装配置、工具声明和依赖，生成普通人可读的权限差异
- 结合维护活跃、漏洞与来源信号给出隔离运行建议，不自动安装
- 核心流程埋点、空状态、错误状态和隐私说明

## Non-goals

- 不做全品类平台
- 不复制参考产品资产
- 未授权不公开部署、不提交商店、不购买服务
