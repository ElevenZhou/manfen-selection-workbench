# Brand and UI direction

## Brand

- Primary name: Release Impact（版本影响）
- Alternate name: ReleaseImpact
- Positioning: 把发布信息从“我看过”变成与代码和产品相连的影响清单
- Personality: 可信, 克制, 直接
- Voice: 短句、结果导向、解释风险，不夸大AI能力。
- Icon direction: 统一1024px母版；使用一个与开发者工具核心动作相关的几何符号，避免竞品近似轮廓。
- Avoid: 竞品近似名称或图标, 渐变AI脑图标, 不可读的小字与装饰性噪声

## UI

- Direction: 单任务、强层级、触控友好；首屏直接进入核心动作。
- Principles: 一次只强调一个主动作, 解释不确定性, 关键操作可撤回, 所有状态可访问
- Typography: 系统无衬线字体；正文不小于16px，关键数字和动作使用清晰字重。

### Color tokens

- `primary`: `#C97722`
- `secondary`: `#F5D5A9`
- `background`: `#FBF8F2`
- `surface`: `#FFFFFF`
- `text`: `#241D16`
- `success`: `#247A5A`
- `warning`: `#A65F00`
- `error`: `#B93B3B`

### Components

- 主行动卡
- 证据/来源卡
- 确认与撤回条
- 结果状态

### Core screens

- 首次进入与权限说明
- 核心任务
- 结果与下一步
- 历史或进度

### Required states

- loading
- empty
- success
- partial
- error
- offline

### Accessibility

- 支持动态字号和高对比
- 触控目标至少44px并提供屏幕阅读器标签
