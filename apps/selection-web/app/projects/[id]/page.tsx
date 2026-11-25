import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { getBuildProject, getCandidateById } from "../../../lib/reports";
import { buildAiStudioPrompt, buildDefaultConcepts } from "../../../lib/aiStudioPrompt";
import { loadReferenceMedia } from "../../../lib/referenceMedia";
import ProjectWorkspace from "./ProjectWorkspace";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await getCandidateById(id);
  if (!candidate) notFound();
  const project = await getBuildProject(id);
  const referenceMedia = await loadReferenceMedia(candidate.references);
  return <AppShell active="projects"><ProjectWorkspace candidate={candidate} initialProject={project} initialPrompt={project?.promptText || buildAiStudioPrompt(candidate)} defaultConcepts={project?.conceptOptions?.length ? project.conceptOptions : buildDefaultConcepts(candidate)} referenceMedia={referenceMedia} /></AppShell>;
}
