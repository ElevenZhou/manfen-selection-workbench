import type { ProductForm, ReferenceKind } from "./types";

export function productFormLabel(form: ProductForm) {
  return {
    mobile_app: "移动 App",
    mobile_game: "手机游戏",
    web_app: "Web 应用",
    desktop_app: "桌面 App",
    cross_platform: "跨端应用",
  }[form];
}

export function referenceKindLabel(kind: ReferenceKind) {
  return {
    mobile_app: "移动 App",
    mobile_game: "手机游戏",
    web_product: "Web 产品",
    desktop_app: "桌面软件",
    open_source_project: "开源项目",
    system_feature: "系统功能",
    developer_platform: "开发平台",
    technical_standard: "技术标准",
    research_report: "研究报告",
  }[kind];
}
