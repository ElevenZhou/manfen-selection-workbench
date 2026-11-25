import { NextResponse } from "next/server";
import { buildAiStudioPrompt } from "../../../../lib/aiStudioPrompt";
import { getBuildProject, getCandidateById, saveBuildProject } from "../../../../lib/reports";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const candidate = await getCandidateById(id);
    if (!candidate) return NextResponse.json({ error: "候选项目不存在" }, { status: 404 });
    const project = await getBuildProject(id);
    const prompt = project?.promptText || buildAiStudioPrompt(candidate);
    return NextResponse.json({ candidate, project, prompt });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "项目读取失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const candidate = await getCandidateById(id);
    if (!candidate) return NextResponse.json({ error: "候选项目不存在" }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    const allowed = ["status", "selectedConcept", "conceptOptions", "aiStudioUrl", "githubUrl", "apkUrl", "testUrl", "testResult", "storeUrl", "notes", "assignee", "promptVersion", "promptText", "promptVersions"];
    const input = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
    const project = await saveBuildProject(id, input);
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "项目保存失败" }, { status: 400 });
  }
}
