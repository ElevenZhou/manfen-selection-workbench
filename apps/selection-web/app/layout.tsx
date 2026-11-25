import type { Metadata } from "next";
import { Noto_Sans_SC, Space_Grotesk } from "next/font/google";
import "./globals.css";

const body = Noto_Sans_SC({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "APP 选品驾驶舱",
    template: "%s · APP 选品驾驶舱",
  },
  description: "统一保存并按时间查看选品报告、候选证据、工作台资料包和开发排期。",
  openGraph: {
    title: "APP 选品驾驶舱",
    description: "三路线独立评选 · 统一报告档案",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "APP 选品驾驶舱" }],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${body.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
