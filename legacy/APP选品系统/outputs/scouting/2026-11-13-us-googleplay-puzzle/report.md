# 美国 Google Play Puzzle 选品执行报告（2026-11-13）

## 任务
分析美国 Google Play Puzzle 榜单，优先选择增长较快、评价较好、可形成明确 1-1 对应竞品的游戏机会；输出 3 个候选。

## 结论
本轮优先进入验证的方向不是简单复制头部榜单，而是从近期上升/趋势榜中选择玩法清晰、规模尚未完全固化、可以做轻量差异化的方向。主对应竞品严格 1-1，其他产品只作为参考对象。

|排名|我们做的方向|主对应竞品（1-1）|公开信号|建议|
|---:|---|---|---|---|
|1|Bolt Out 式螺丝/拆解益智的更强离线版|Bolt Out - Puzzle Game|美国 Puzzle 免费榜第 6，趋势榜第 2；4.6 星；约 337K 安装|SELECTED，做离线优先、低广告、触控容错和关卡编辑器|
|2|Sort Streak 式颜色排序竞速|Sort Streak: Color Puzzle|美国 Puzzle 趋势榜第 4；4.7 星；约 237K 安装|SELECTED，做每日种子、竞速计时和失败后快速重开|
|3|MOVLO 式逻辑谜题合集的单机制版本|MOVLO: Logic Puzzle|美国 Puzzle 趋势榜第 7；4.9 星；约 698K 安装|SELECTED，做单一逻辑机制、每日挑战和可解释提示|

## 证据边界
AppBrain 的美国 Google Play Puzzle 榜显示：Meowdoku、Block Blast、Rotate Rings、Magic Sort、Gossip Harbor 位于免费榜前列；Bolt Out 排名 41、4.6 星、约 230K 安装。AppsXray 的 2026-11-12 快照显示 Bolt Out 免费榜第 6、约 337K 安装，趋势榜第 2；Sort Streak 趋势榜第 4、约 237K 安装、4.7 星；MOVLO 趋势榜第 7、约 698K 安装、4.9 星。榜单和安装数是公开第三方观测，不等于收入、留存或利润证明。

## 验证计划
每个方向先做 1 个可玩的灰盒；每个灰盒至少完成 30 名目标玩家的定性测试，测首次理解时间、首关完成率、重开率、广告容忍度和次日回访意愿。未完成测试前保持 SELECTED/灰盒验证，不进入 READY_FOR_BENCH。

## 来源
- https://www.appbrain.com/stats/google-play-rankings/topgrossing/puzzle/us
- https://appsxray.com/charts?category=GAME_PUZZLE
- https://appsxray.com/charts?category=GAME_PUZZLE&chart=trending
