# 域名与飞书

## 正式站点

统一使用 `https://select.1add2.com` 作为 `PUBLIC_APP_URL`。所有报告、资料包、任务详情和 Feishu 按钮都从服务端配置生成绝对链接，禁止把临时预览域名写进业务产物。

域名切换前检查：DNS、TLS、canonical、robots、健康接口、登录回调、报告详情、资料包下载、Feishu 卡片链接和旧地址重定向。

## 飞书推送

- Webhook 只放在服务端 Secret：`FEISHU_SELECTION_WEBHOOK_URL`。
- 只有报告入库并读回成功后才生成卡片。
- 每次推送使用 `{report_id}:feishu-summary:v1` 或明确的人工幂等键。
- 卡片保留 A/B/C 路线、候选中文显示名、主对应竞品/参考对象、资料包和完整报告链接。
- HTTP 200 且业务 `code=0` 才是成功；失败保存回执，不自动重复发送。

## 外部变更边界

本项目文档和本地配置可以先完成；DNS、服务器、Feishu 生产 Webhook、OIDC 回调和 Git 远程仓库需要凭据后按发布门禁执行，不能用占位值宣称上线。
