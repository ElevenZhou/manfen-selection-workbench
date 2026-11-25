# 贡献指南

感谢你关注满分选品工作台。

## 开发环境

- Node.js `>=22.13.0`
- npm
- Cloudflare Wrangler 由 `apps/selection-web` 的开发依赖提供

```bash
cd apps/selection-web
npm install
npm test
npm run lint
npm run dev
```

## 提交变更

1. 先阅读根目录 `README.md`、`docs/00-product-contract.md` 和 `docs/09-quality-release-gates.md`。
2. 保持任务状态、报告证据、幂等键和审计事件的一致性。
3. 不要提交 `.env`、Webhook、Token、Cookie、供应商密钥或本机运行产物。
4. 新功能需要补充可重复的测试或说明为什么现有测试足够。
5. 提交前运行 `npm test`、`npm run lint` 和 `git diff --check`。

## Pull Request

请说明变更目的、影响范围、验证命令和已知限制。涉及数据模型时，请同时更新迁移和数据模型文档。涉及公开页面时，请附页面路径和截图或浏览器验证结果。
