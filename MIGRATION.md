# 资料迁移清单

迁移日期：2026-11-25（Asia/Singapore）

## 结论

旧项目的可安全复用资料已经放入 `/Users/xmm/projects/满分选品系统`。后续开发入口统一为本目录；旧目录保留为迁移源和远端 Git 访问位置，不再作为新功能的工作目录。

## 已迁移内容

| 新目录 | 来源 | 内容 |
| --- | --- | --- |
| `apps/selection-web/` | `APP选品系统/site/` | 旧站点源代码、数据库迁移、测试、报告数据、资料包和部署配置（排除缓存与本地密钥） |
| `legacy/APP选品系统/docs/` | `APP选品系统/docs/` | 旧选品方法、Schema 约定、Feishu 发布规范、部署和制作档案资料 |
| `legacy/APP选品系统/config/` | `APP选品系统/config/` | 名称、产品形态、参考链接、发布默认值和来源示例 |
| `legacy/APP选品系统/schemas/` | `APP选品系统/schemas/` | 候选、证据、信号、任务、结果、报告和资料包 Schema |
| `legacy/APP选品系统/scripts/` | `APP选品系统/scripts/` | 运行、资料包、报告、验证和在线快照脚本 |
| `legacy/APP选品系统/data/` | `APP选品系统/data/` | 初始候选数据 |
| `legacy/APP选品系统/outputs/` | `APP选品系统/outputs/` | 选品运行产物、网站 payload、卡片和回执 |
| `legacy/APP选品系统/design/` | `APP选品系统/design/` | 旧版设计稿、主题模板和参考图 |
| `legacy/APP选品系统/.worker-runs/` | `APP选品系统/.worker-runs/` | 任务运行回执和网站报告产物 |
| `legacy/APP选品系统/archives/` | `APP选品系统/*.tar.gz` | 历史站点快照和更新包，物理归档但不纳入 Git |

## 有意排除

- `site/.git/`：不嵌套旧 Git；新项目由根目录 Git 统一管理。旧远端和封板信息记录在 [`site-git-baseline.txt`](legacy/APP选品系统/site-git-baseline.txt)。
- `site/.env.local`：包含本地运行密钥，不迁移。
- `有账号密码的案例.md`：名称表明可能包含账号密码，不复制到新项目；如需使用，先做脱敏版本。
- `node_modules/`、`dist/`、`.wrangler/`、`.vinext/`、`.DS_Store`：构建缓存和本机临时文件不迁移。

## 以后从哪里开发

1. 产品、架构、派发规则和提示词：根目录 `docs/`、`prompts/`、`project-brief.md`。
2. 现有站点能力：`apps/selection-web/`。
3. 新的账号、派发、容量、研究执行器：按 `src/README.md` 和 `tasks/backlog.md` 增量实现。
4. 历史资料只读参考：`legacy/APP选品系统/`。

## 迁移后验证

- 在 `apps/selection-web/` 执行 `npm ci` 成功。
- 在 `apps/selection-web/` 执行 `npm test`：构建通过，13/13 测试通过。
- 在 `apps/selection-web/` 执行 `npm run lint`：0 errors，3 个既有 warning。
- 迁移后的 Worker 默认项目根目录已改为 `/Users/xmm/projects/满分选品系统`，Schema、运行产物和 `.env.local` 查找路径不再指向旧目录。

