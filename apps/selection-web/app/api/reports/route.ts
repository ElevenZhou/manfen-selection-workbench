import { NextResponse } from "next/server";
import { listReports, saveReport } from "../../../lib/reports";

export async function GET() {
  return NextResponse.json({ reports: await listReports() });
}

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const id = await saveReport(input);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid report" },
      { status: 400 },
    );
  }
}
