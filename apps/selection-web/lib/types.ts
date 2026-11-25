export type RouteId = "A" | "B" | "C";
export type ProductForm = "mobile_app" | "mobile_game" | "web_app" | "desktop_app" | "cross_platform";
export type ReferenceKind =
  | "mobile_app"
  | "mobile_game"
  | "web_product"
  | "desktop_app"
  | "open_source_project"
  | "system_feature"
  | "developer_platform"
  | "technical_standard"
  | "research_report";

export type ReportPayload = {
  marketPulse: string;
  sources: string[];
  scheduledCount: number;
};

export type Report = {
  id: string;
  periodLabel: string;
  publishedAt: string;
  title: string;
  summary: string;
  status: string;
  totalSelected: number;
  totalPackages: number;
  sourceRunId: string;
  methodologyVersion: string;
  payload: ReportPayload;
};

export type AppReference = {
  name: string;
  nameZh: string;
  kind: ReferenceKind;
  url: string;
  store: "apple_app_store" | "google_play" | null;
  storeUrl: string | null;
  relation: "competitor" | "similar" | "substitute";
  apkDownloads?: ApkDownload[];
};

export type ApkDownload = {
  provider: "apkmirror" | "uptodown" | "f_droid" | "amazon_appstore" | "aurora_store" | "aptoide" | "apkpure" | "other";
  label: string;
  url: string;
  status: "verified" | "needs_verification";
};

export type Candidate = {
  id: string;
  reportId: string;
  route: RouteId;
  title: string;
  titleZh: string;
  productForm: ProductForm;
  category: string;
  market: string;
  routeScore: number;
  routeRank: number;
  decision: "ROUTE_SELECTED" | "ROUTE_BACKUP" | "ROUTE_WATCH" | "REJECTED";
  dataCompleteness: number;
  opportunity: string;
  improvements: string[];
  packageStatus: "READY_FOR_BENCH" | "DRAFT" | "BLOCKED";
  packageId: string | null;
  packageUrl: string | null;
  packageSha256: string | null;
  references: AppReference[];
  iconUrl: string | null;
  iconSource: "product" | "competitor" | "generated";
  iconSourceUrl: string | null;
};

export type CandidateArchiveEntry = Candidate & {
  reportTitle: string;
  periodLabel: string;
  publishedAt: string;
};

export type ProjectStatus = "SELECTED" | "RESEARCHING" | "CONCEPTS_READY" | "CONCEPT_SELECTED" | "BUILD_BRIEF_READY" | "SENT_TO_AI_STUDIO" | "BUILDING" | "FIRST_VERSION_READY" | "QA_REVIEW" | "RELEASE_CANDIDATE" | "PUBLISHED" | "PAUSED";

export type ProjectConcept = {
  id: string;
  name: string;
  theme: string;
  visual: string;
  innovation: string;
  painPoint: string;
};

export type PromptVersion = {
  version: string;
  text: string;
  createdAt: string;
};

export type ProjectRecord = {
  candidateId: string;
  status: ProjectStatus;
  selectedConcept: string | null;
  conceptOptions: ProjectConcept[];
  aiStudioUrl: string | null;
  githubUrl: string | null;
  apkUrl: string | null;
  testUrl: string | null;
  testResult: string;
  storeUrl: string | null;
  notes: string;
  assignee: string;
  promptVersion: string;
  promptText: string;
  promptVersions: PromptVersion[];
  updatedAt: string;
};

export type CandidateArchiveFilters = {
  reportId?: string;
  route?: RouteId;
  decision?: Candidate["decision"];
  packageStatus?: Candidate["packageStatus"];
  productForm?: ProductForm;
  category?: string;
  market?: string;
  query?: string;
};

export type DashboardMetrics = {
  reportCount: number;
  selectedCount: number;
  backupCount: number;
  watchCount: number;
  packageReadyCount: number;
  averageCompleteness: number | null;
  latestCollectedAt: string | null;
};

export type DashboardTaskSummary = {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
};
