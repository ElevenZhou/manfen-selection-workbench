import { NextResponse } from "next/server";
import { getChatGPTUser } from "../../../../chatgpt-auth";
import { pushReportToFeishu } from "../../../../../lib/feishu";
import { getReport } from "../../../../../lib/reports";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录后再推送" }, { status: 401 });
  }

  const { id } = await params;
  const data = await getReport(id);
  if (!data) {
    return NextResponse.json({ error: "没有找到对应报告" }, { status: 404 });
  }

  try {
    const body = await request.json() as { idempotencyKey?: unknown };
    if (
      typeof body.idempotencyKey !== "string" ||
      !/^[A-Za-z0-9:_-]{16,160}$/.test(body.idempotencyKey)
    ) {
      return NextResponse.json({ error: "无效的推送标识" }, { status: 400 });
    }
    const url = new URL(request.url);
    const result = await pushReportToFeishu({
      ...data,
      origin: url.origin,
      requestedBy: user.email,
      idempotencyKey: body.idempotencyKey,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "飞书推送失败" },
      { status: 500 },
    );
  }
}
