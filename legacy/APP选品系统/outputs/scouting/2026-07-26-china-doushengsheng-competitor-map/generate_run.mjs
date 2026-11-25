import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const runId = "2026-07-26-china-doushengsheng-competitor-map";
const collectedAt = "2026-07-26T21:15:00+08:00";

const refs = {
  dss: {
    name: "Dou Sheng Sheng（抖省省）",
    kind: "mobile_app",
    relation: "seed_direct_competitor",
    store: "apple_app_store",
    store_url: "https://apps.apple.com/cn/app/id6756863766",
    url: "https://apps.apple.com/cn/app/id6756863766",
  },
  meituan: {
    name: "Meituan（美团）",
    kind: "mobile_app",
    relation: "direct_competitor",
    store: "apple_app_store",
    store_url: "https://apps.apple.com/cn/app/id423084029",
    url: "https://www.meituan.com/",
  },
  dianping: {
    name: "Dianping（大众点评）",
    kind: "mobile_app",
    relation: "direct_competitor",
    store: "apple_app_store",
    store_url: "https://apps.apple.com/cn/app/id351091731",
    url: "https://www.dianping.com/",
  },
  amap: {
    name: "Amap（高德地图）",
    kind: "mobile_app",
    relation: "direct_competitor",
    store: "apple_app_store",
    store_url: "https://apps.apple.com/cn/app/id461703208",
    url: "https://www.amap.com/",
  },
  alipay: {
    name: "Alipay（支付宝）",
    kind: "mobile_app",
    relation: "adjacent_product",
    store: "apple_app_store",
    store_url: "https://apps.apple.com/cn/app/id333206289",
    url: "https://www.alipay.com/",
  },
  yitao: {
    name: "Yitao（一淘）",
    kind: "mobile_app",
    relation: "adjacent_product",
    store: "apple_app_store",
    store_url: "https://apps.apple.com/cn/app/id451400917",
    url: "https://www.etao.com/",
  },
  smzdm: {
    name: "SMZDM（什么值得买）",
    kind: "mobile_app",
    relation: "adjacent_product",
    store: "apple_app_store",
    store_url: "https://apps.apple.com/cn/app/id518213356",
    url: "https://www.smzdm.com/",
  },
  sqkb: {
    name: "Shengqian Kuaibao（省钱快报）",
    kind: "mobile_app",
    relation: "adjacent_product",
    store: "apple_app_store",
    store_url: "https://apps.apple.com/cn/app/id1116025300",
    url: "https://apps.apple.com/cn/app/id1116025300",
  },
  douyin: {
    name: "Douyin（抖音）",
    kind: "mobile_app",
    relation: "substitute",
    store: "apple_app_store",
    store_url: "https://apps.apple.com/cn/app/id1142110895",
    url: "https://www.douyin.com/",
  },
  xhs: {
    name: "RedNote（小红书）",
    kind: "mobile_app",
    relation: "substitute",
    store: "apple_app_store",
    store_url: "https://apps.apple.com/cn/app/id741292507",
    url: "https://www.xiaohongshu.com/",
  },
};

const common = {
  run_id: runId,
  category: "Local Deals / 本地生活优惠",
  type: "utility",
  target_market: "CN",
  source_engine: "competitor_validated",
  source_run_id: runId,
  reference_gate_type: "direct_competitor",
  signal_ids: [],
  route_methodology_version: "app-opportunity-scout-v1",
};

const candidates = [
  {
    ...common,
    candidate_id: "DSS-01",
    name: "ClearDeal Local（明价到店）",
    product_form: "mobile_app",
    target_user: "会在抖省省、美团、大众点评等多平台比价的城市到店消费者",
    core_job: "在下单前确认同店同套餐的真实到手价、限制与可退款性",
    direct_competitor_count: 4,
    data_completeness: 0.84,
    demand_score: 19, growth_score: 10, durability_score: 8, usage_score: 7,
    monetization_score: 8, pain_score: 14, competitor_quality_score: 10,
    ai_reuse_score: 4, acquisition_score: 4, total_score: 84,
    route_score: 84, route_rank: 1, confidence: "medium", decision: "SELECTED",
    improvement_1: "把平台券、会员价、支付优惠和套餐限制折算成可核验的最终到手价",
    improvement_2: "同店同套餐归一化后跨平台比较，并展示价格采集时间",
    improvement_3: "下单前给出退款、预约、节假日和核销限制的风险卡",
    next_validation: "在上海、成都各抓取100个同店套餐，人工核验匹配准确率与最终价偏差；达不到90%匹配准确率则停止。",
    references: [refs.dss, refs.meituan, refs.dianping, refs.amap, refs.yitao],
    deep_dive: true,
  },
  {
    ...common,
    candidate_id: "DSS-02",
    name: "VoucherPilot（券管家）",
    product_form: "mobile_app",
    target_user: "在多个本地生活平台囤有团购券、容易忘记使用或退款的消费者",
    core_job: "统一查看待使用、临期、需预约和可退款的团购券并完成处置",
    direct_competitor_count: 4,
    data_completeness: 0.82,
    demand_score: 18, growth_score: 8, durability_score: 9, usage_score: 8,
    monetization_score: 7, pain_score: 14, competitor_quality_score: 9,
    ai_reuse_score: 4, acquisition_score: 4, total_score: 81,
    route_score: 81, route_rank: 2, confidence: "medium", decision: "SELECTED",
    improvement_1: "从订单截图、短信或日历导入券信息，不要求共享平台账号密码",
    improvement_2: "按距离、到期日、预约要求和退款状态统一排序与提醒",
    improvement_3: "退款前解释实际退回金额和优惠券损失，并保留证据清单",
    next_validation: "招募20名多平台用户导入至少100张券，验证字段识别、提醒命中和退款说明准确率；任何账号抓取方案都不进入MVP。",
    references: [refs.dss, refs.meituan, refs.dianping, refs.alipay],
    deep_dive: true,
  },
  {
    ...common,
    candidate_id: "DSS-03",
    name: "TermsLens Local（团购规则眼）",
    product_form: "mobile_app",
    target_user: "担心预约、节假日、适用门店、加价和退款限制的团购消费者",
    core_job: "在付款前快速看懂套餐能否在自己的时间、门店和人数条件下使用",
    direct_competitor_count: 3,
    data_completeness: 0.81,
    demand_score: 18, growth_score: 9, durability_score: 8, usage_score: 8,
    monetization_score: 7, pain_score: 12, competitor_quality_score: 10,
    ai_reuse_score: 3, acquisition_score: 4, total_score: 79,
    route_score: 79, route_rank: 3, confidence: "medium", decision: "SELECTED",
    improvement_1: "从套餐截图或分享链接抽取预约、节假日、门店、时段、人数、叠加和退款限制",
    improvement_2: "结合用户输入的使用计划给出红黄绿风险，并逐条链接回原文",
    improvement_3: "生成下单前确认清单，不代替平台规则或客服结论",
    next_validation: "人工标注200个团购套餐条款，验证关键限制召回率与错误警告率；关键限制召回低于95%则不进入交易前场景。",
    references: [refs.dss, refs.meituan, refs.dianping, refs.amap],
    deep_dive: true,
  },
  {
    ...common,
    candidate_id: "DSS-04",
    name: "DealProof（优惠验真）",
    product_form: "mobile_app",
    target_user: "担心宣传优惠无法兑现或到店条件变化的价格敏感用户",
    core_job: "在下载、跳转和到店前验证优惠是否真实可买、可用",
    direct_competitor_count: 4, data_completeness: 0.78,
    demand_score: 17, growth_score: 8, durability_score: 8, usage_score: 6,
    monetization_score: 6, pain_score: 14, competitor_quality_score: 9,
    ai_reuse_score: 3, acquisition_score: 3, total_score: 74,
    route_score: 74, route_rank: 4, confidence: "medium", decision: "BACKUP",
    improvement_1: "记录优惠最近一次成功购买与核销时间", improvement_2: "对跳转失效、券消失和套餐不一致给出风险标记",
    improvement_3: "允许用户提交脱敏订单凭证以提高可信度",
    next_validation: "先验证用户是否愿意提交脱敏核销证据，以及平台条款是否允许该聚合方式。",
    references: [refs.dss, refs.meituan, refs.dianping, refs.yitao], deep_dive: false,
  },
  {
    ...common,
    candidate_id: "DSS-05",
    name: "RouteBite（顺路吃）",
    product_form: "mobile_app",
    target_user: "通勤、逛街或旅行途中想顺路找到可立即核销优惠的消费者",
    core_job: "在不明显绕路的前提下找到当前可用、可信且划算的到店套餐",
    direct_competitor_count: 4, data_completeness: 0.74,
    demand_score: 16, growth_score: 7, durability_score: 8, usage_score: 6,
    monetization_score: 7, pain_score: 11, competitor_quality_score: 9,
    ai_reuse_score: 2, acquisition_score: 4, total_score: 70,
    route_score: 70, route_rank: 5, confidence: "low", decision: "WATCH",
    improvement_1: "用绕路分钟数而不是直线距离排序", improvement_2: "过滤需预约、非营业时段和节假日不可用套餐",
    improvement_3: "只给最省钱、最顺路、最稳妥三个选择", next_validation: "用30条真实路线对比高德+团购App；不能节省30%决策时间则并入明价到店。",
    references: [refs.dss, refs.meituan, refs.dianping, refs.amap], deep_dive: false,
  },
  {
    ...common,
    candidate_id: "DSS-06",
    name: "Family Deal Wallet（家庭券包）",
    product_form: "mobile_app",
    target_user: "家庭或伴侣共同购买、代用和核销团购券的人",
    core_job: "在不共享主账号密码的前提下协同管理家庭团购券",
    direct_competitor_count: 3, data_completeness: 0.69,
    demand_score: 14, growth_score: 6, durability_score: 8, usage_score: 6,
    monetization_score: 6, pain_score: 10, competitor_quality_score: 8,
    ai_reuse_score: 2, acquisition_score: 3, total_score: 63,
    route_score: 63, route_rank: 6, confidence: "low", decision: "WATCH",
    improvement_1: "共享券摘要、到期提醒和使用人，不共享支付信息", improvement_2: "核销后自动归档并同步家庭账本",
    improvement_3: null, next_validation: "访谈15个家庭，确认真实共享频率与平台券是否允许转赠。",
    references: [refs.dss, refs.meituan, refs.alipay], deep_dive: false,
  },
  {
    ...common,
    candidate_id: "DSS-07",
    name: "AccessDeal（长辈省心团购）",
    product_form: "mobile_app",
    target_user: "需要更大字号、清楚规则和家人协助的中老年团购用户",
    core_job: "安全地找到、购买并核销本地优惠，不被复杂券规则困住",
    direct_competitor_count: 4, data_completeness: 0.67,
    demand_score: 14, growth_score: 6, durability_score: 8, usage_score: 5,
    monetization_score: 5, pain_score: 9, competitor_quality_score: 9,
    ai_reuse_score: 3, acquisition_score: 2, total_score: 61,
    route_score: 61, route_rank: 7, confidence: "low", decision: "WATCH",
    improvement_1: "把套餐限制翻译成大字版三问：何时能用、到店加不加钱、退不退",
    improvement_2: "家人远程只读协助和核销演练", improvement_3: null,
    next_validation: "完成10名55岁以上用户可用性测试；不能显著降低求助次数则停止。",
    references: [refs.dss, refs.meituan, refs.dianping, refs.alipay], deep_dive: false,
  },
  {
    ...common,
    candidate_id: "DSS-08",
    name: "SmallCity Saver（小城省）",
    product_form: "mobile_app",
    target_user: "三四线城市和县域中寻找本地小店优惠的消费者",
    core_job: "发现主流平台覆盖不足的本地商户真实优惠",
    direct_competitor_count: 3, data_completeness: 0.61,
    demand_score: 13, growth_score: 5, durability_score: 7, usage_score: 4,
    monetization_score: 6, pain_score: 7, competitor_quality_score: 7,
    ai_reuse_score: 2, acquisition_score: 3, total_score: 54,
    route_score: 54, route_rank: 8, confidence: "low", decision: "WATCH",
    improvement_1: "微信分享链接和商家二维码即可建档", improvement_2: "到店核销后才形成公开可信度",
    improvement_3: null, next_validation: "选一个县级市验证50家商户供给和100名用户复用；当前没有足够覆盖证据。",
    references: [refs.dss, refs.meituan, refs.dianping], deep_dive: false,
  },
  {
    ...common,
    candidate_id: "DSS-09",
    name: "Merchant Fairness Desk（商家申诉台）",
    product_form: "web_app",
    target_user: "同时经营抖音生活服务、美团和大众点评的小微本地商家",
    core_job: "统一整理差评、订单和申诉证据，减少多平台经营摩擦",
    direct_competitor_count: 3, data_completeness: 0.64,
    demand_score: 14, growth_score: 6, durability_score: 8, usage_score: 5,
    monetization_score: 7, pain_score: 9, competitor_quality_score: 7,
    ai_reuse_score: 4, acquisition_score: 2, total_score: 62,
    route_score: 62, route_rank: 9, confidence: "low", decision: "WATCH",
    improvement_1: "按平台规则生成证据清单和事实型申诉草稿", improvement_2: "记录处理时限和结果，不自动发布回复",
    improvement_3: null, next_validation: "访谈20家多平台商户并核对各平台授权边界；该机会偏B端，不与前三名共用MVP。",
    references: [refs.dss, refs.meituan, refs.dianping], deep_dive: false,
  },
  {
    ...common,
    candidate_id: "DSS-10",
    name: "Taste-to-Deal（种草到优惠）",
    product_form: "mobile_app",
    target_user: "在抖音、小红书被种草后，希望快速确认附近门店和可用优惠的年轻消费者",
    core_job: "把内容中的店铺意图转换为可比较、可到店的套餐选择",
    direct_competitor_count: 3, data_completeness: 0.66,
    demand_score: 15, growth_score: 7, durability_score: 6, usage_score: 5,
    monetization_score: 6, pain_score: 8, competitor_quality_score: 8,
    ai_reuse_score: 4, acquisition_score: 4, total_score: 63,
    route_score: 63, route_rank: 10, confidence: "low", decision: "WATCH",
    improvement_1: "从分享链接提取店名、城市和套餐意图", improvement_2: "优先返回同店可核销套餐而不是相似推荐",
    improvement_3: "明确显示跳转后商品是否一致", next_validation: "测试100条抖音/小红书分享链接的实体匹配率，并先完成平台合规审查。",
    references: [refs.dss, refs.douyin, refs.xhs, refs.dianping], deep_dive: false,
  },
];

// Public evidence in this run does not include downloads, MAU, retention or
// revenue. Keep those dimensions at zero and do not promote a candidate merely
// to fill the requested qualified count.
const publicEvidenceScores = {
  "DSS-01": { data_completeness: 0.68, demand_score: 19, growth_score: 0, durability_score: 5, usage_score: 0, monetization_score: 2, pain_score: 14, competitor_quality_score: 10, ai_reuse_score: 4, acquisition_score: 4 },
  "DSS-02": { data_completeness: 0.66, demand_score: 18, growth_score: 0, durability_score: 6, usage_score: 0, monetization_score: 2, pain_score: 14, competitor_quality_score: 9, ai_reuse_score: 4, acquisition_score: 3 },
  "DSS-03": { data_completeness: 0.64, demand_score: 17, growth_score: 0, durability_score: 5, usage_score: 0, monetization_score: 1, pain_score: 12, competitor_quality_score: 9, ai_reuse_score: 4, acquisition_score: 3 },
  "DSS-04": { data_completeness: 0.61, demand_score: 16, growth_score: 0, durability_score: 4, usage_score: 0, monetization_score: 1, pain_score: 13, competitor_quality_score: 8, ai_reuse_score: 3, acquisition_score: 3 },
  "DSS-05": { data_completeness: 0.58, demand_score: 15, growth_score: 0, durability_score: 5, usage_score: 0, monetization_score: 1, pain_score: 9, competitor_quality_score: 8, ai_reuse_score: 3, acquisition_score: 3 },
  "DSS-06": { data_completeness: 0.52, demand_score: 12, growth_score: 0, durability_score: 5, usage_score: 0, monetization_score: 1, pain_score: 8, competitor_quality_score: 7, ai_reuse_score: 2, acquisition_score: 2 },
  "DSS-07": { data_completeness: 0.50, demand_score: 12, growth_score: 0, durability_score: 5, usage_score: 0, monetization_score: 1, pain_score: 8, competitor_quality_score: 7, ai_reuse_score: 3, acquisition_score: 2 },
  "DSS-08": { data_completeness: 0.44, demand_score: 10, growth_score: 0, durability_score: 4, usage_score: 0, monetization_score: 1, pain_score: 5, competitor_quality_score: 6, ai_reuse_score: 2, acquisition_score: 2 },
  "DSS-09": { data_completeness: 0.51, demand_score: 13, growth_score: 0, durability_score: 5, usage_score: 0, monetization_score: 2, pain_score: 8, competitor_quality_score: 7, ai_reuse_score: 4, acquisition_score: 2 },
  "DSS-10": { data_completeness: 0.53, demand_score: 14, growth_score: 0, durability_score: 4, usage_score: 0, monetization_score: 1, pain_score: 7, competitor_quality_score: 7, ai_reuse_score: 4, acquisition_score: 3 },
};
for (const candidate of candidates) {
  Object.assign(candidate, publicEvidenceScores[candidate.candidate_id]);
  candidate.total_score = [
    "demand_score","growth_score","durability_score","usage_score","monetization_score",
    "pain_score","competitor_quality_score","ai_reuse_score","acquisition_score",
  ].reduce((sum, key) => sum + candidate[key], 0);
  candidate.route_score = candidate.total_score;
  candidate.decision = "WATCH";
  candidate.confidence = candidate.route_rank <= 3 ? "medium" : "low";
}

const evidence = [
  ["DSS-01","Dou Sheng Sheng（抖省省）","seed_direct_competitor",refs.dss.store_url,"mobile_app","app_store_rating",4.2,"stars","current page","official","Apple App Store",refs.dss.url,"3951个评分；榜单#1购物；页面为动态快照。"],
  ["DSS-01","Dou Sheng Sheng（抖省省）","seed_direct_competitor",refs.dss.store_url,"mobile_app","rating_count",3951,"ratings","current page","official","Apple App Store",refs.dss.url,"需求代理，不等于下载量或活跃。"],
  ["DSS-01","Dou Sheng Sheng（抖省省）","seed_direct_competitor",refs.dss.store_url,"mobile_app","category_rank",1,"Shopping rank","current page","official","Apple App Store",refs.dss.url,"中国区App Store购物榜页面观察。"],
  ["DSS-01","Meituan（美团）","direct_competitor",refs.meituan.store_url,"mobile_app","rating_count",1130000,"ratings","current page","official","Apple App Store",refs.meituan.store_url,"公开评分量代理，非活跃用户。"],
  ["DSS-01","Dianping（大众点评）","direct_competitor",refs.dianping.store_url,"mobile_app","rating_count",2490000,"ratings","current page","official","Apple App Store",refs.dianping.store_url,"公开评分量代理，页面列为生活榜#1。"],
  ["DSS-01","Amap（高德地图）","direct_competitor",refs.amap.store_url,"mobile_app","rating_count",27430000,"ratings","current page","official","Apple App Store",refs.amap.store_url,"高德官方页称覆盖300+城市、160多万家商户。"],
  ["DSS-01","Yitao（一淘）","adjacent_product",refs.yitao.store_url,"mobile_app","rating_count",180000,"ratings","current page","official","Apple App Store",refs.yitao.store_url,"官方页明确提供同款优惠、历史折扣与比价。"],
  ["DSS-02","Dou Sheng Sheng（抖省省）","direct_competitor",refs.dss.store_url,"mobile_app","review_theme","订单无法自定义排序","recent review","observed","Apple App Store Reviews","https://apps.apple.com/cn/app/id6756863766?see-all=reviews","用户希望按附近或状态找已购券。"],
  ["DSS-02","Meituan（美团）","direct_competitor",refs.meituan.store_url,"mobile_app","refund_rule","实际支付金额退款；券与促销抵扣另计","rule current","official","美团规则中心","https://rules-center.meituan.com/m/detail/guize/386003?activeRule=1","规则表明券生命周期和退款金额存在解释负担。"],
  ["DSS-02","Meituan（美团）","direct_competitor",refs.meituan.store_url,"mobile_app","review_theme","预付团购退款等待与承诺争议","recent review","observed","Apple App Store Reviews","https://apps.apple.com/cn/app/id423084029?see-all=reviews","单条评论仅作主题证据，不代表总体发生率。"],
  ["DSS-02","Alipay（支付宝）","adjacent_product",refs.alipay.store_url,"mobile_app","rating_count",1140000,"ratings","current page","official","Apple App Store",refs.alipay.store_url,"官方页称提供1000+生活服务；评分4.1。"],
  ["DSS-03","Meituan（美团）","direct_competitor",refs.meituan.store_url,"mobile_app","terms_fields","有效期、预约、地址、营业时间、退款等条件需在购买前阅读","current rule","official","美团点评团购用户服务条款","https://portal-portm.meituan.com/webpc/protocolmanage/comment","官方条款列出多类购买前注意条件。"],
  ["DSS-03","Internet Platform Pricing Rules（互联网平台价格行为规则）","leading_signal",null,"technical_standard","regulatory_requirement","促销限制和额外服务需清晰展示","effective 2026-04-10","official","国家市场监督管理总局","https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/jjjzs/art/2025/art_eef66659c9624c5091bd3acd050b1710.html","法规支持透明解释需求，不代表第三方可替平台承诺。"],
  ["DSS-03","Dou Sheng Sheng（抖省省）","direct_competitor",refs.dss.store_url,"mobile_app","review_theme","宣传优惠跳转后套餐不一致或无法购买","recent review","observed","Apple App Store Reviews","https://apps.apple.com/cn/app/id6756863766?see-all=reviews","支持交易前核对商品与条件的需求。"],
  ["DSS-04","Dou Sheng Sheng（抖省省）","direct_competitor",refs.dss.store_url,"mobile_app","review_theme","跨App优惠跳转后商品不一致或网络异常","recent review","observed","Apple App Store Reviews","https://apps.apple.com/cn/app/id6756863766?see-all=reviews","直接支持优惠验真方向。"],
  ["DSS-04","Yitao（一淘）","adjacent_product",refs.yitao.store_url,"mobile_app","review_theme","红包吸引下载后无法兑换","2024 review","observed","Apple App Store",refs.yitao.store_url,"相邻品类存在同类信任问题。"],
  ["DSS-05","Dou Sheng Sheng（抖省省）","direct_competitor",refs.dss.store_url,"mobile_app","app_size",543.8,"MB","current page","official","Apple App Store",refs.dss.store_url,"轻量化痛点代理；大小会随版本变化。"],
  ["DSS-05","Douyin（抖音）","substitute",refs.douyin.store_url,"mobile_app","app_size",1400,"MB","current page","official","Apple App Store",refs.douyin.store_url,"页面显示约1.4GB，支持独立轻量入口的假设。"],
  ["DSS-09","Douyin Laike（抖音来客）","direct_competitor","https://apps.apple.com/cn/app/id1603172928","mobile_app","rating_count",450000,"ratings","current page","official","Apple App Store","https://apps.apple.com/cn/app/id1603172928","B端需求代理；官方页列出门店、团购、经营与结算。"],
  ["DSS-09","Dianping（大众点评）","direct_competitor",refs.dianping.store_url,"mobile_app","review_theme","商家对评价规则与申诉透明度不满","recent review","observed","Apple App Store",refs.dianping.store_url,"单条商家评论，需进一步访谈验证频率。"],
  ["DSS-10","RedNote（小红书）","substitute",refs.xhs.store_url,"mobile_app","rating_count",20950000,"ratings","current page","official","Apple App Store",refs.xhs.store_url,"种草入口需求代理，不等于本地团购转化。"],
  ["DSS-10","Douyin（抖音）","substitute",refs.douyin.store_url,"mobile_app","rating_count",52060000,"ratings","current page","official","Apple App Store",refs.douyin.store_url,"内容入口规模代理，不等于本地生活用户数。"],
].map((x, i) => ({
  run_id: runId, evidence_id: `E-${String(i + 1).padStart(3, "0")}`,
  candidate_id: x[0], competitor: x[1], role: x[2], store_url: x[3],
  country: "CN", platform: "iOS", metric: x[5], value: x[6], unit: x[7],
  period: x[8], collected_at: collectedAt, value_type: x[9], source_name: x[10],
  source_url: x[11], notes: x[12], entity_kind: x[4],
}));

const themes = [
  ["DSS-01","Dou Sheng Sheng（抖省省）","value","比抖音内同店价格更省",2,"2026-05 to 2026-06","https://apps.apple.com/cn/app/id6756863766?see-all=reviews","有券且力度足够会继续使用","medium"],
  ["DSS-01","Dou Sheng Sheng（抖省省）","pain","优惠券减少或消失",3,"2026-05 to 2026-06","https://apps.apple.com/cn/app/id6756863766?see-all=reviews","优惠逐步减少，最后无券","medium"],
  ["DSS-01","Dou Sheng Sheng（抖省省）","pain","跨端宣传价无法购买",1,"2026-06","https://apps.apple.com/cn/app/id6756863766?see-all=reviews","跳转后套餐不一致并报网络异常","low"],
  ["DSS-02","Dou Sheng Sheng（抖省省）","request","已购券按状态、距离或时间排序",2,"2026","https://apps.apple.com/cn/app/id6756863766?see-all=reviews","希望增加排序，方便附近使用已购券","medium"],
  ["DSS-02","Meituan（美团）","pain","退款等待与券抵扣解释不清",2,"2026","https://apps.apple.com/cn/app/id423084029?see-all=reviews","未使用券退款与等待期引发争议","low"],
  ["DSS-03","Amap（高德地图）","value","导航、到店行为和附近决策在同一流程",1,"current product description",refs.amap.store_url,"顺路买花、加油、取咖啡","medium"],
  ["DSS-04","Yitao（一淘）","pain","优惠承诺在下载或兑换时失效",1,"2024-10",refs.yitao.store_url,"下载后兑换入口已无库存","low"],
  ["DSS-05","Dou Sheng Sheng（抖省省）","value","独立工具入口比内容流更直接",1,"current product description",refs.dss.store_url,"按店名搜索并直接展示团购","medium"],
  ["DSS-09","Dianping（大众点评）","pain","商家评价申诉标准不透明",2,"2026-04",refs.dianping.store_url,"提交凭证后仍难理解判定","low"],
  ["DSS-10","Dou Sheng Sheng（抖省省）","pain","种草商品跳转后实体不一致",1,"2026-06",refs.dss.store_url,"原套餐跳转失败而推荐其他套餐","low"],
].map((x) => ({
  run_id: runId, candidate_id: x[0], competitor: x[1], theme_type: x[2],
  theme: x[3], review_count: x[4], period: x[5], country: "CN", platform: "iOS",
  source_url: x[6], example_excerpt: x[7], confidence: x[8],
}));

const sources = [...new Map(evidence.map((e) => [e.source_url, {
  name: e.source_name, url: e.source_url, collected_at: e.collected_at,
  value_type: e.value_type,
}])).values()];

function csv(rows, cols) {
  const q = (v) => {
    if (v === null || v === undefined) return "";
    const s = Array.isArray(v) ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  return "\uFEFF" + [cols.join(","), ...rows.map((r) => cols.map((c) => q(r[c])).join(","))].join("\n") + "\n";
}

const candidateCols = [
  "run_id","candidate_id","name","category","type","product_form","target_market","target_user","core_job",
  "source_engine","source_run_id","reference_gate_type","signal_ids","direct_competitor_count","data_completeness",
  "demand_score","growth_score","durability_score","usage_score","monetization_score","pain_score",
  "competitor_quality_score","ai_reuse_score","acquisition_score","total_score","route_score","route_rank",
  "route_methodology_version","confidence","decision","improvement_1","improvement_2","improvement_3","next_validation",
];
const evidenceCols = [
  "run_id","candidate_id","competitor","role","store_url","country","platform","metric","value","unit","period",
  "collected_at","value_type","source_name","source_url","notes","entity_kind",
];
const themeCols = [
  "run_id","candidate_id","competitor","theme_type","theme","review_count","period","country","platform",
  "source_url","example_excerpt","confidence",
];

const report = `# 抖省省竞品扩展机会研究

> Run ID: \`${runId}\`  
> 模式：\`competitor-expand\`  
> 市场：中国大陆；平台证据以中国区 Apple App Store 和官方规则页为主  
> 采集时间：2026-07-26（Asia/Singapore）

## 1. 范围与假设

- 起点确认为北京抖音科技的官方本地生活团购 App **Dou Sheng Sheng（抖省省）**，App Store ID 为 \`6756863766\`；不是旧的同名返利 App。
- 研究对象包含直接竞品、相邻省钱/比价产品和内容/小程序式替代方案。
- 未购买 Appfigures、Similarweb 或 Sensor Tower 数据；因此没有把下载量、MAU、收入或留存写成已知事实。
- App Store 评分量、榜单、功能描述和公开评论是当前公开代理指标。页面会动态变化，不能等同于活跃用户。
- “SELECTED”仅表示有资格进入 Engine A 候选池，不代表已经批准开发或具备工作台资料包。

## 2. 排名机会

| 排名 | 机会 | 核心任务 | 分数 | 完整度 | 决策 |
|---:|---|---|---:|---:|---|
${candidates.map((c) => `| ${c.route_rank} | **${c.name}** | ${c.core_job} | ${c.total_score} | ${(c.data_completeness * 100).toFixed(0)}% | ${c.decision} |`).join("\n")}

前三名共同依赖的是“主动消费决策”，不是复制抖省省的补贴模式：用户要确认 **买哪一个、现在能不能用、最终到底花多少、买完如何不浪费**。

**本轮没有候选达到 SELECTED。** 原因不是机会弱，而是公开证据没有下载、MAU、留存、收入与跨竞品大样本评论；按技能门禁，这些缺失维度计零，不能为了凑满 3 个而补分。下面的 3 个深研对象均为 \`WATCH\`，完成所列验证后再复评。

## 3. 深度研究 1：ClearDeal Local（明价到店）

### 一句话产品

给会在多个团购平台比价的城市消费者，一个可核验的“同店同套餐最终到手价”比较器。

### 已验证依据

- 抖省省官方页把“同店团购比价”和额外补贴作为核心卖点；当前页面显示 4.2 分、3,951 个评分及中国区购物榜第 1。这是需求代理，不是下载或活跃数据。
- 美团、大众点评和高德均在官方产品页覆盖本地生活、优惠、地点搜索或到店决策；高德官方页还描述了 300+ 城市、160 多万家线下商户。
- 抖省省近期公开评论重复出现“券减少/消失”，另有跨端宣传优惠跳转后套餐不一致和网络异常；一淘评论也出现“为红包下载后无法兑换”的相邻信任问题。

### 只做三件事

1. 同店同套餐实体归一化，不把“看似相同”直接合并。
2. 把券、会员、支付优惠和限制折算为有时间戳的最终价。
3. 下单前展示退款、预约、节假日、加价和核销风险卡。

### AI 位置

AI 只用于套餐文本结构化、同店实体匹配和限制条款摘要；价格计算由确定性规则完成。低置信匹配必须并排展示，不能自动宣布“最低价”。

### 最小版本与商业化

- MVP：上海、成都；餐饮与咖啡两个高频类目；仅支持用户粘贴分享链接/截图，不做登录态抓取。
- 收入：平台允许前提下的导购佣金；不向用户出售“排名靠前”。
- 风险：平台深链、价格时效、同套餐识别错误、商家差异套餐、导购合规。

### 验收/停止

抓取两城各 100 个同店套餐，人工核验实体匹配与最终价。匹配准确率低于 90%，或价格时效无法明确展示，则不进入开发台。

## 4. 深度研究 2：VoucherPilot（券管家）

### 一句话产品

让多平台囤券用户用截图、短信或日历统一管理待用、临期、预约和退款，不共享平台账号密码。

### 已验证依据

- 抖省省评论明确请求订单自定义排序，并提到核销后对账、评价或找旧券困难。
- 美团公开规则说明退款按实际支付金额处理，券、积分和促销抵扣有独立规则；近期公开评论仍出现预付券退款等待与承诺争议。
- 抖省省、美团、大众点评和支付宝都承担订单/生活服务入口，证明多入口并存；支付宝官方页称平台内有超过 1,000 种生活服务。

### 只做三件事

1. 截图/短信/日历导入，不收集账号密码。
2. 统一按到期、距离、预约和退款状态排序并提醒。
3. 退款前解释预计退回金额、失效优惠和需要保留的凭证。

### AI 位置

AI/OCR 识别截图和条款；确定性校验负责金额、日期与提醒。识别不确定时要求用户确认，不自动发起退款。

### 最小版本与商业化

- MVP：iOS；本地加密；先支持 3 种标准截图模板与手工补录。
- 收入：家庭版订阅或一次性买断；不依赖导购排序。
- 风险：截图模板频繁变化、通知权限、隐私、退款规则更新。

### 验收/停止

20 名多平台用户导入至少 100 张券；关键字段准确率、提醒送达率和规则解释由人工复核。任何需要模拟登录或绕过平台限制的方案直接停止。

## 5. 深度研究 3：TermsLens Local（团购规则眼）

### 一句话产品

在付款前把长套餐规则转换成“这次到底能不能用”的可追溯检查结果。

### 已验证依据

- 美团公开团购服务条款要求用户关注有效期、预约时间、退款条件、商户地址、营业时间等多项限制，说明关键条件分散且阅读负担真实存在。
- 2026 年施行的《互联网平台价格行为规则》要求促销限制、额外服务和价格条件清晰展示；监管要求支持“解释清楚”，但不代表第三方可以替平台作承诺。
- 抖省省近期评论出现宣传优惠跳转后套餐不一致/无法购买，说明用户需要在交易前确认“看到的”和“能买到的”是否一致。

### 只做三件事

1. 抽取预约、节假日、适用门店、时段、人数、加价、叠加和退款限制。
2. 结合用户的使用计划给出红黄绿风险，并链接回原条款。
3. 生成下单前确认清单，不替平台或客服作法律/退款结论。

### AI 位置

AI/OCR 负责结构化套餐文字；规则引擎负责日期、人数和门店条件。任何无法定位到原文的结论必须标成“待确认”。

### 最小版本与商业化

- MVP：用户主动导入截图/分享链接；餐饮与休闲娱乐两类；不抓账号、不代下单。
- 收入：作为券管家高级功能订阅，或独立的一次性买断。
- 风险：OCR 漏项、条款更新、截图截断、用户把风险提示误认为平台承诺。

### 验收/停止

人工标注 200 个套餐；关键限制召回率低于 95%，或错误红灯导致明显误阻断，则只保留为研究工具，不进入交易前场景。

## 6. 竞品与替代地图

| 对象 | 类型 | 角色 | 可学习机制 | 不应复制 |
|---|---|---|---|---|
| [Dou Sheng Sheng（抖省省）](${refs.dss.store_url}) | 移动 App | 种子/直接竞品 | 同店团购搜索、补贴、抖音订单同步 | 名称、图标、补贴承诺、账号关系 |
| [Meituan（美团）](${refs.meituan.store_url}) | 移动 App | 直接竞品 | 全品类供给、退款规则、AI找店找券 | 商户数据、评价、品牌资产 |
| [Dianping（大众点评）](${refs.dianping.store_url}) | 移动 App | 直接竞品 | 真实体验内容、城市发现、客服会话 | 评论内容与评分资产 |
| [Amap（高德地图）](${refs.amap.store_url}) | 移动 App | 直接竞品 | 路线、到店行为、附近服务 | 地图数据和扫街榜资产 |
| [Yitao（一淘）](${refs.yitao.store_url}) | 移动 App | 相邻产品 | 历史价、同款优惠、拍图找低价 | 电商商品库和返利关系 |
| [SMZDM（什么值得买）](${refs.smzdm.store_url}) | 移动 App | 相邻产品 | 价格历史、内容验证、AI关注 | 社区内容和用户关系 |
| [Douyin（抖音）](${refs.douyin.store_url}) | 移动 App | 替代方案 | 内容种草与交易跳转 | 内容、账号、推荐算法 |
| [RedNote（小红书）](${refs.xhs.store_url}) | 移动 App | 替代方案 | 生活方式发现和探店意图 | UGC、达人关系、品牌 |

## 7. 用户价值与痛点主题

- 价值：独立入口让“主动找店/找优惠”比刷内容更直接；当券真实可用时，用户愿意重复使用。
- 痛点：优惠持续性不可预测；跨端跳转后套餐可能变化；订单/券难以按使用状态和距离整理；退款金额和券损失难理解。
- 证据边界：当前公开评论样本很小，不能声称主题发生率。前三个候选进入下一步前必须补 200–500 条跨竞品、双时间窗评论或付费数据。

## 8. 保留与观察

- **DealProof（优惠验真）**：问题强，但用户提交证据的冷启动和平台条款未验证，继续观察。
- **QuietLocal（清爽附近）**：轻量体验有吸引力，但“少信息流”本身不足以形成付费差异。
- **Family Deal Wallet（家庭券包）**、**AccessDeal（长辈省心团购）**、**SmallCity Saver（小城省）**：人群合理，当前没有足够的跨竞品重复痛点或覆盖数据。
- **Merchant Fairness Desk（商家申诉台）**：商家痛点存在，但属于相邻 B 端机会，应另开定向研究。
- **Taste-to-Deal（种草到优惠）**：实体匹配与平台合规风险高，先验证分享链接识别。

## 9. 缺失证据与下一步

1. 购买或授权获取 Appfigures / Similarweb / Sensor Tower 的中国区下载、MAU、留存、收入与 3/6/12 月趋势；当前这些维度只给保守分。
2. 对抖省省、美团、大众点评、高德各采集 200–500 条评论，分最近 90 天和 12 个月做主题计数。
3. 安装体验至少抖省省、美团、大众点评和高德，录制同一任务的步骤、时间、失败和退款路径。
4. 完成分享链接、价格展示与导购佣金的法律/平台规则审查。
5. 前三名先做数据与可用性验证；不要同时进入开发台。

## 10. 来源

${sources.map((s) => `- [${s.name}](${s.url}) — ${s.value_type}，采集于 2026-07-26。`).join("\n")}
`;

const website = {
  run: {
    id: runId, date: "2026-07-26", mode: "competitor-expand",
    direction: "china-doushengsheng-competitor-map",
    scope: "中国市场，以抖省省为起点，直接竞品、相邻产品和替代方案",
    status: "completed_provisional_public_evidence",
    freshness: collectedAt, source_count: sources.length,
  },
  summary: {
    discovered: candidates.length,
    ranked: candidates.length,
    deep_dives: candidates.filter((c) => c.deep_dive).length,
    selected: candidates.filter((c) => c.decision === "SELECTED").length,
    backup: candidates.filter((c) => c.decision === "BACKUP").length,
    watch: candidates.filter((c) => c.decision === "WATCH").length,
    rejected: candidates.filter((c) => c.decision === "REJECTED").length,
  },
  candidates: candidates.map((c) => ({
    id: c.candidate_id, title: c.name.split("（")[0], titleZh: c.name.match(/（(.+)）/)?.[1] ?? "",
    category: c.category, productForm: c.product_form, score: c.total_score,
    decision: c.decision, confidence: c.confidence, dataCompleteness: c.data_completeness,
    targetUser: c.target_user, coreJob: c.core_job,
    improvements: [c.improvement_1, c.improvement_2, c.improvement_3].filter(Boolean),
    competitors: c.references.map((r) => ({
      name: r.name.split("（")[0], nameZh: r.name.match(/（(.+)）/)?.[1] ?? "",
      kind: r.kind, relation: r.relation, store: r.store, storeUrl: r.store_url, url: r.url,
    })),
    evidenceSummary: evidence.filter((e) => e.candidate_id === c.candidate_id).map((e) => ({
      metric: e.metric, value: e.value, unit: e.unit, valueType: e.value_type, sourceUrl: e.source_url,
    })),
    productBrief: { targetUser: c.target_user, coreJob: c.core_job, nextValidation: c.next_validation },
    sourceLinks: [...new Set(c.references.map((r) => r.store_url || r.url).filter(Boolean))],
    deepDive: c.deep_dive,
  })),
  methodology: {
    scoring_version: "app-opportunity-scout-v1",
    gates: { selected_min_score: 75, selected_min_completeness: 0.8, selected_min_direct_competitors: 3, independent_source_types: 2 },
    estimate_notice: "本轮未使用付费市场估算。App Store评分量和榜单仅作为公开代理，不等于下载、活跃、收入或留存。",
    missing_data_notice: "下载、MAU、留存、收入、3/6/12月趋势和大样本评论主题仍需授权数据或进一步采集。",
  },
};

const run = {
  run_id: runId, created_at: collectedAt, completed_at: collectedAt,
  mode: "competitor-expand", direction: "china-doushengsheng-competitor-map",
  status: "completed_provisional_public_evidence",
  request: "以中国市场抖省省App为起点，研究直接竞品、相邻产品和替代方案，输出10个机会，深度研究3个。",
  scope: { country: ["CN"], platforms: ["iOS"], ranked_count: 10, deep_dive_count: 3, qualified_count: 3 },
  assumptions: [
    "种子为北京抖音科技有限公司、App Store ID 6756863766 的官方本地团购App。",
    "没有付费下载/MAU/收入/留存数据；公开商店数据仅作代理。",
    "SELECTED表示可进入Engine A候选池，不表示READY_FOR_BENCH。",
  ],
  sources, counts: website.summary,
};

const qa = {
  run_id: runId, checked_at: collectedAt, status: "pass_with_warnings",
  checks: [
    { name: "ranked_count", pass: candidates.length === 10, value: candidates.length },
    { name: "deep_dive_count", pass: candidates.filter((c) => c.deep_dive).length === 3, value: candidates.filter((c) => c.deep_dive).length },
    { name: "selected_hard_gates", pass: candidates.filter((c) => c.decision === "SELECTED").every((c) => c.total_score >= 75 && c.data_completeness >= 0.8 && c.direct_competitor_count >= 3) },
    { name: "qualified_count_shortfall_disclosed", pass: candidates.filter((c) => c.decision === "SELECTED").length === 0, value: "0 of requested 3; missing paid market/usage and large-sample review evidence" },
    { name: "product_form_present", pass: candidates.every((c) => c.product_form) },
    { name: "reference_kind_and_store_links", pass: candidates.every((c) => c.references.every((r) => r.kind && (!r.kind.startsWith("mobile_") || r.store_url))) },
    { name: "numeric_claim_metadata", pass: evidence.filter((e) => typeof e.value === "number").every((e) => e.country && e.platform && e.period && e.collected_at && e.value_type && e.source_url) },
    { name: "improvement_limit", pass: candidates.every((c) => [c.improvement_1,c.improvement_2,c.improvement_3].filter(Boolean).length <= 3) },
  ],
  warnings: [
    "未接入付费市场数据，增长、使用、收入和留存维度证据不足。",
    "公开评论主题样本量小，review_count是本轮明确观察到的条目数，不是总体发生率。",
    "App Store页面数据动态变化；不同搜索快照出现过评分量差异，本轮采用采集时打开页面值。",
  ],
};

const queries = {
  run_id: runId, collected_at: collectedAt,
  queries: [
    "抖省省 app 中国 官网", "抖省省 App Store", "\"抖省省\" 用户 评论",
    "site:apps.apple.com/cn/app 美团 App Store", "site:apps.apple.com/cn/app 大众点评 App Store",
    "site:apps.apple.com/cn/app 高德地图 团购 App Store", "美团 团购券 退款 规则",
    "site:apps.apple.com/cn/app 一淘 App Store", "site:apps.apple.com/cn/app 什么值得买 App Store",
    "抖省省 用户 评论 优惠券 网络异常 订单 排序",
  ],
};

fs.writeFileSync(path.join(dir, "run.json"), JSON.stringify(run, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "report.md"), report);
fs.writeFileSync(path.join(dir, "signals.json"), "[]\n");
fs.writeFileSync(path.join(dir, "candidates.json"), JSON.stringify(candidates, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "candidates.csv"), csv(candidates, candidateCols));
fs.writeFileSync(path.join(dir, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "evidence.csv"), csv(evidence, evidenceCols));
fs.writeFileSync(path.join(dir, "review-themes.csv"), csv(themes, themeCols));
fs.writeFileSync(path.join(dir, "website.json"), JSON.stringify(website, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "qa.json"), JSON.stringify(qa, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "queries.json"), JSON.stringify(queries, null, 2) + "\n");
