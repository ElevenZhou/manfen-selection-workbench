# KOL监控、AI分析与推送专项 2+1+0

- Run ID: `2026-07-26-kol-monitoring-2x1x0`
- 方向：kol-monitoring-ai-analysis-push
- 数据方式：联网大模型现用现查；没有持续爬虫；公开证据不等于付费供应商精确指标。
- 路线：A、B、C独立评分和排名，不做跨路线总分。

## 本轮结论

### Route A · 2个

#### 1. Creator Guard（达人守望） · Web 应用 · 87/100

- 用户：同时管理20–300名合作或观察达人、但没有专职风控分析师的品牌与小型代理团队
- 核心任务：只在合作价值、合规或声誉真正变化时收到带证据的预警，并快速分派处理
- 机会：把达人内容监控从全量信息流变成可解释、可确认、可分派的品牌风险变化队列
- 参考：[Modash（达人营销管理）](https://help.modash.io/en/articles/10485038-how-modash-captures-all-your-creator-content), [HypeAuditor Media Monitor（媒体监控）](https://hypeauditor.com/media-monitor/), [Sprout Social Influencer Marketing（芽社达人营销）](https://sproutsocial.com/influencer-marketing/)
- 改进：把新增、删除、竞品提及、披露缺失和品牌规则命中归并成有严重度与原文证据的变化事件；AI只解释为什么值得处理，并要求人工确认后再分派；相似事件在冷却窗口内合并推送
- 下一验证：游戏招募至少30名方向性玩家；非游戏完成5–8名目标用户任务测试并测量核心结果。

#### 2. Thesis Watch（观点追踪） · Web 应用 · 84/100

- 用户：需要持续跟踪行业专家、研究员和高影响账号观点变化的投资、战略与研究团队
- 核心任务：识别谁在何时改变了什么判断、依据是什么，并把变化而不是所有帖子推给团队
- 机会：把KOL信息流转换为可回溯的观点版本、证据变化和低噪声推送，而不是再做一张热度榜
- 参考：[Kaito Pro（凯拓智能情报）](https://pro.kaito.ai/portal), [Santiment Social Trends（社交趋势分析）](https://academy.santiment.net/sanbase/social-trends/), [LunarCrush（月球社交情报）](https://lunarcrush.com/)
- 改进：按人和主题维护观点版本，只在结论、置信度、时间窗口或关键依据变化时生成差异卡；推送同时展示原文、反方证据和AI不确定性，不把情绪或互动量直接写成事实
- 下一验证：游戏招募至少30名方向性玩家；非游戏完成5–8名目标用户任务测试并测量核心结果。

### Route B · 1个

#### 1. Signal Relay（信号接力） · Web 应用 · 89/100

- 用户：依赖20–100个关键账号获取市场信息、但只能用平台关注、群聊、表格和人工摘要的小型业务团队
- 核心任务：把自选关注名单的新内容去重、按业务问题分析，并在固定节奏或高优事件时送达团队协作工具
- 机会：从关注名单到决策简报只保留来源、变化、影响和负责人四件事，让小团队无需购买完整达人营销套件
- 参考：[Google Alerts（谷歌提醒）](https://support.google.com/websearch/answer/4815696?hl=en), [Feedly AI Feeds（智能订阅流）](https://feedly.com/new-features/posts/track-specific-topics-and-trends-with-feedly-ai), [Inoreader Automations（阅读器自动化）](https://us.inoreader.com/vi/blog/2026/01/save-time-with-automations.html)
- 改进：允许团队从RSS、公开网页、邮件转发和手动链接建立来源清单，用业务问题而非关键词定义相关性；把重复内容合并为一个证据簇，输出变化、影响、原文和建议负责人，并按紧急度选择日报或即时推送
- 下一验证：游戏招募至少30名方向性玩家；非游戏完成5–8名目标用户任务测试并测量核心结果。

### Route C · 0个

## 公共市场依据

- [Modash Creator Content Tracking](https://help.modash.io/en/articles/10485038-how-modash-captures-all-your-creator-content)：Modash 官方说明其活动跟踪会自动收集 Instagram、TikTok 与 YouTube 上创作者发布的帖子、Reel、Story 和视频，包括未带品牌标签的内容。
- [HypeAuditor Media Monitor](https://hypeauditor.com/media-monitor/)：HypeAuditor 官方提供按账号、标签和关键词建立自定义内容流，覆盖 Instagram、YouTube 与 TikTok，并支持竞品、UGC 和品牌提及监控。
- [Sprout Social Influencer Marketing](https://sproutsocial.com/influencer-marketing/)：Sprout Social 官方产品包含创作者发现、品牌安全、AI Brand Fit、审批、归因和报告，证明品牌侧愿意为创作者风险与效果工作流付费。
- [Kaito Pro](https://pro.kaito.ai/portal)：Kaito Pro 官方提供跨大量 Web3 来源的搜索、情绪分析、自定义观察列表、实时 Smart Alerts、项目与叙事 Mindshare。
- [Santiment Social Trends](https://academy.santiment.net/sanbase/social-trends/)：Santiment 官方按社交提及异常识别趋势，并用 AI 解释主题突然增长的原因、历史和观点。
- [Feedly AI Feeds](https://feedly.com/new-features/posts/track-specific-topics-and-trends-with-feedly-ai)：Feedly 官方说明 AI Feeds 会从大量文章、报告和社交内容中判断相关性，并允许用户限制可信来源和组合语义条件。
- [Inoreader Monitoring and Automations](https://us.inoreader.com/vi/blog/2026/01/save-time-with-automations.html)：Inoreader 官方规则可以过滤高容量信息流、生成摘要并触发推送通知、Webhook 与外部服务动作。
- [Small Agency Manual Tracking Discussion](https://www.reddit.com/r/SocialMediaMarketing/comments/1i6mub7/mini_tool_for_tracking_influencer_campaigns_on/)：一名小型代理从业者描述每天花大量时间把 TikTok/Instagram 帖子指标复制进表格，同时认为完整企业套件价格和范围不匹配；该讨论只作为痛点线索，不代表市场规模。

## 假设与缺口

- KOL包括品牌达人、行业专家和可配置的关键意见账号，不限定单一平台
- 首版只使用官方API、授权数据、RSS、公开网页和用户主动提交链接，不以绕过平台限制的爬虫作为前提
- AI结论必须附原始内容、时间和来源；推送默认采用飞书、Slack或邮件中的一种，不自动替用户作经营或投资决策
- 没有授权的全量社交历史、App级收入、活跃和留存数据，因此先验证任务完成和付费意向
- 没有授权的App级收入、DAU/MAU和留存原始数据；相关判断使用公开下载档位、评论、产品活跃度和行业趋势代理。
- 所有游戏候选必须先过灰盒和玩家测试，当前结论不宣称玩法已经好玩。
