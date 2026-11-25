import { NextResponse } from "next/server";
import { getBuildProject, listCandidateArchive } from "../../../lib/reports";

export async function GET() {
  try {
    const candidates = await listCandidateArchive({ decision: "ROUTE_SELECTED" });
    const projects = await Promise.all(candidates.map(async (candidate) => ({ candidate, project: await getBuildProject(candidate.id) })));
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "制作档案读取失败" }, { status: 500 });
  }
}
