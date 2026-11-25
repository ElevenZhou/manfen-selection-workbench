# Brand and UI direction

## Brand

- Primary name: Dose Quiet（静药提醒）
- Alternate name: DoseQuiet
- Positioning: 把多药确认压缩到通知层，同时只把漏服风险升级给照护者
- Personality: 可信, 克制, 直接
- Voice: 短句、结果导向、解释风险，不夸大AI能力。
- Icon direction: 统一1024px母版；使用一个与健康工具核心动作相关的几何符号，避免竞品近似轮廓。
- Avoid: 竞品近似名称或图标, 渐变AI脑图标, 不可读的小字与装饰性噪声

## UI

- Direction: 单任务、强层级、触控友好；首屏直接进入核心动作。
- Principles: 一次只强调一个主动作, 解释不确定性, 关键操作可撤回, 所有状态可访问
- Typography: 系统无衬线字体；正文不小于16px，关键数字和动作使用清晰字重。

### Color tokens

- `primary`: `#315DDC`
- `secondary`: `#AFC4FF`
- `background`: `#F6F8FC`
- `surface`: `#FFFFFF`
- `text`: `#142033`
- `success`: `#23866B`
- `warning`: `#B7791F`
- `error`: `#C2413B`

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
