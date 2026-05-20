export type AccountState = "new" | "partial" | "mature";
export type Screen = "home" | "ask" | "connections" | "library" | "search";

export interface Connection {
  src: string;
  status: "ok" | "warn" | "err" | "idle";
  docs: number;
  lastSync: string;
  connectedBy: string;
  note?: string;
}

export interface Thread {
  id: string;
  q: string;
  srcs: string[];
  when: string;
  by: string;
}

export interface SuggestedPrompt {
  tag: string;
  q: string;
  srcs: string[];
}

export interface PinnedItem {
  q: string;
  srcs: string[];
  when: string;
}

export interface Space {
  name: string;
  emoji: string;
  desc: string;
  count: number;
  members: string[];
  updated: string;
}

export interface OnboardingStep {
  id: string;
  label: string;
  done: boolean;
}

export interface TeamActivity {
  who: string;
  initials: string;
  action: string;
  q: string;
  when: string;
  srcs: string[];
}

export interface SourceMeta {
  label: string;
  cls: string;
}

export const SOURCES: Record<string, SourceMeta> = {
  notion:      { label: "Notion",           cls: "src-notion" },
  slack:       { label: "Slack",            cls: "src-slack" },
  drive:       { label: "Google Drive",     cls: "src-drive" },
  github:      { label: "GitHub",           cls: "src-github" },
  linear:      { label: "Linear",           cls: "src-linear" },
  jira:        { label: "Jira",             cls: "src-jira" },
  confluence:  { label: "Confluence",       cls: "src-confluence" },
  figma:       { label: "Figma",            cls: "src-figma" },
  zendesk:     { label: "Zendesk",          cls: "src-zendesk" },
  hubspot:     { label: "HubSpot",          cls: "src-hubspot" },
  salesforce:  { label: "Salesforce",       cls: "src-salesforce" },
  teams:       { label: "Microsoft Teams",  cls: "src-teams" },
  dropbox:     { label: "Dropbox",          cls: "src-dropbox" },
  asana:       { label: "Asana",            cls: "src-asana" },
  clickup:     { label: "ClickUp",          cls: "src-clickup" },
  sharepoint:  { label: "SharePoint",       cls: "src-sharepoint" },
  trello:      { label: "Trello",           cls: "src-trello" },
};

export const DISCOVER_CONNECTORS: Record<string, string> = {
  hubspot:    "Marketing campaigns, CRM contacts, deal stages.",
  salesforce: "Accounts, opportunities, customer history.",
  teams:      "Channels, meeting notes, direct messages.",
  dropbox:    "Shared folders and team files.",
  asana:      "Projects, tasks, status updates.",
  clickup:    "Docs, lists, sprints, comments.",
  sharepoint: "Site pages, libraries, team docs.",
  trello:     "Boards, cards, attached docs.",
};

export const WORKSPACE_DATA = {
  user: { name: "Maya Chen", initials: "MC", role: "Engineering · IC4" },
  org:  { name: "Lumen Robotics", plan: "Team · 38 seats" },

  connectionsByState: {
    new: [] as Connection[],
    partial: [
      { src: "notion",  status: "ok"   as const, docs: 1284, lastSync: "2 min ago",  connectedBy: "Maya Chen" },
      { src: "slack",   status: "ok"   as const, docs: 8723, lastSync: "live",        connectedBy: "Devin Park" },
      { src: "drive",   status: "warn" as const, docs: 412,  lastSync: "12 hr ago",  connectedBy: "Maya Chen", note: "Permission scope changed" },
    ],
    mature: [
      { src: "notion",      status: "ok"   as const, docs: 4128,  lastSync: "1 min ago",  connectedBy: "Maya Chen" },
      { src: "slack",       status: "ok"   as const, docs: 24891, lastSync: "live",        connectedBy: "Devin Park" },
      { src: "drive",       status: "ok"   as const, docs: 6502,  lastSync: "4 min ago",  connectedBy: "Maya Chen" },
      { src: "github",      status: "ok"   as const, docs: 1842,  lastSync: "8 min ago",  connectedBy: "Sara Iwu" },
      { src: "linear",      status: "ok"   as const, docs: 723,   lastSync: "live",        connectedBy: "Sara Iwu" },
      { src: "confluence",  status: "warn" as const, docs: 891,   lastSync: "3 hr ago",   connectedBy: "Tom Bryne", note: "Rate-limited, retrying" },
      { src: "jira",        status: "ok"   as const, docs: 1209,  lastSync: "12 min ago", connectedBy: "Tom Bryne" },
      { src: "figma",       status: "ok"   as const, docs: 318,   lastSync: "20 min ago", connectedBy: "Lena Park" },
      { src: "zendesk",     status: "ok"   as const, docs: 1402,  lastSync: "live",        connectedBy: "Priya Anand" },
    ],
  },

  discover: ["hubspot", "salesforce", "teams", "dropbox", "asana", "clickup", "sharepoint", "trello"],

  threads: [
    { id: "t1", q: "How do we handle ROS bag rotation in field deployments?",    srcs: ["notion", "slack", "github"],    when: "12 min ago", by: "You" },
    { id: "t2", q: "What's the policy for shipping firmware over LTE?",           srcs: ["notion", "confluence"],         when: "1 hr ago",   by: "You" },
    { id: "t3", q: "Who owns the perception team OKRs this quarter?",             srcs: ["notion", "linear"],             when: "Yesterday",  by: "You" },
    { id: "t4", q: "How do customers configure dock alignment offset?",           srcs: ["zendesk", "notion", "slack"],   when: "Mon",        by: "You" },
    { id: "t5", q: "Latest staging deploy checklist for v2.4?",                   srcs: ["github", "notion"],             when: "Mon",        by: "You" },
  ] as Thread[],

  suggested: [
    { tag: "Onboard",   q: "What does engineering onboarding week 1 look like?",   srcs: ["notion", "slack"] },
    { tag: "Decide",    q: "Why did we pick gRPC over REST for the fleet API?",    srcs: ["confluence", "github"] },
    { tag: "Find",      q: "Who's the on-call for perception this week?",           srcs: ["slack", "linear"] },
    { tag: "Catch up",  q: "Summarise this week's customer escalations.",           srcs: ["zendesk", "slack"] },
  ] as SuggestedPrompt[],

  pinned: [
    { q: "Production incident playbook · sev 1",    srcs: ["notion", "slack"],         when: "Pinned by Maya" },
    { q: "Q3 OKR tree, all teams",                  srcs: ["notion", "linear"],        when: "Pinned by Tom" },
    { q: "Dock alignment customer FAQ (latest)",    srcs: ["zendesk", "notion"],       when: "Pinned by Priya" },
    { q: "Firmware release process & sign-offs",    srcs: ["confluence", "github"],    when: "Pinned by Sara" },
  ] as PinnedItem[],

  spaces: [
    { name: "Perception Team",        emoji: "👁️", desc: "Models, datasets, evaluation runs, weekly reviews.",                count: 142, members: ["SI", "TB", "MC"], updated: "8 min ago" },
    { name: "Customer Success",       emoji: "💬", desc: "Escalations, FAQs, configurations, deployment notes.",             count: 308, members: ["PA", "LP", "MC"], updated: "1 hr ago" },
    { name: "Firmware & Hardware",    emoji: "⚙️", desc: "Bring-up notes, ECOs, supplier comms, calibration.",              count: 96,  members: ["DP", "SI"],       updated: "Yesterday" },
    { name: "Go-to-Market",           emoji: "🚀", desc: "Positioning, deck assets, pilot reports, pricing decks.",         count: 78,  members: ["TB", "LP"],       updated: "Yesterday" },
    { name: "Engineering Onboarding", emoji: "📘", desc: "Week-1 ramp, codebase tour, environment setup.",                  count: 41,  members: ["MC", "SI"],       updated: "3 days ago" },
  ] as Space[],

  onboarding: [
    { id: "ws",     label: "Create your workspace",      done: true },
    { id: "invite", label: "Invite a teammate",           done: true },
    { id: "src1",   label: "Connect a first source",      done: true },
    { id: "src2",   label: "Connect 2 more sources",      done: false },
    { id: "perms",  label: "Review permission mapping",   done: false },
    { id: "ask",    label: "Ask your first question",     done: false },
  ] as OnboardingStep[],

  teamActivity: [
    { who: "Devin Park",  initials: "DP", action: "asked",  q: "Latest customer SLA on dock alignment?",  when: "4 min ago",  srcs: ["zendesk", "notion"] },
    { who: "Sara Iwu",    initials: "SI", action: "pinned", q: "Firmware release process & sign-offs",    when: "32 min ago", srcs: ["confluence", "github"] },
    { who: "Tom Bryne",   initials: "TB", action: "asked",  q: "Which PRDs reference perception KPIs?",   when: "1 hr ago",   srcs: ["notion"] },
    { who: "Priya Anand", initials: "PA", action: "asked",  q: "How long do we keep customer logs?",      when: "2 hr ago",   srcs: ["confluence", "drive"] },
  ] as TeamActivity[],
};

export const ACTIVE_THREAD = {
  id: "t1",
  q: "How do we handle ROS bag rotation in field deployments?",
  asked: "12 min ago by Maya Chen",
  messages: [
    {
      role: "user" as const,
      text: "How do we handle ROS bag rotation in field deployments? Specifically — what's the size cap per bag, retention policy, and where do they get uploaded?",
    },
    {
      role: "ai" as const,
      paragraphs: [
        { html: 'On fleet robots, ROS bags are <b>rotated every 256 MB or every 5 minutes</b>, whichever comes first <CIT n="1" />. The rotator runs as a systemd service (<code>moos-bagrot.service</code>) and writes to <code>/var/log/moos/bags/</code>. The 256 MB cap was chosen to keep upload chunks within the LTE backhaul window <CIT n="2" />.' },
        { html: '<b>Retention on the robot</b> is 72 hours; bags are then deleted locally after a successful upload acknowledgment <CIT n="1" />. If the robot is offline, bags pile up until disk reaches 80% utilization, at which point the oldest are dropped — there\'s an alert that fires at 70% so the field team can intervene <CIT n="3" />.' },
        { html: '<b>Upload destination</b> is the <code>fleet-telemetry</code> bucket on GCS, partitioned by <code>{fleet}/{robot}/{date}/{bag}.bag</code>. The customer-success team has read-only access to a subset (no raw camera frames) defined in the dataset permission policy <CIT n="4" />.' },
      ],
      sources: [
        { n: 1, src: "notion",     title: "Field deployment runbook · v2.4",          meta: "Updated 3 days ago · by Sara Iwu", excerpt: "Bag rotation is configured in /etc/moos/bagrot.toml. Size cap: 256MB. Time cap: 5m. After upload-ack, local copy is removed." },
        { n: 2, src: "confluence", title: "LTE backhaul sizing study (Q1)",            meta: "Page · 18 KB",                     excerpt: "We targeted a 4-minute median upload over LTE assuming -90 dBm RSSI. 256MB fits within p95 transfer time." },
        { n: 3, src: "slack",      title: "#fleet-ops · disk-utilization alert thread", meta: "Channel · 14 replies",             excerpt: "Bumped the warn threshold from 60% to 70% — fewer false alarms when robots are idle in dock for >24h." },
        { n: 4, src: "github",     title: "moos-bag-policy / permissions.yaml",        meta: "main · 4 KB",                      excerpt: "customer_success: read; exclude: camera/raw; include: lidar, imu, odometry, planner_debug." },
      ],
      followups: [
        "What happens when the robot can't reach the upload endpoint?",
        "Is the 256 MB cap configurable per fleet?",
        "Who owns the moos-bagrot.service runbook?",
      ],
    },
  ],
  people: [
    { initials: "SI", name: "Sara Iwu",    role: "Owns the runbook",     meta: "3 docs" },
    { initials: "DP", name: "Devin Park",  role: "Fleet ops lead",       meta: "12 msgs" },
    { initials: "TB", name: "Tom Bryne",   role: "Authored the policy",  meta: "2 docs" },
  ],
  perms: [
    { label: "Engineering · IC4 (your role)",  ok: true },
    { label: "Fleet-ops channel access",       ok: true },
    { label: "Customer raw camera frames",     ok: false },
  ],
};

export const SEARCH_RESULTS = {
  query: "dock alignment offset",
  ai: "Customers configure dock alignment offset via <b>Settings → Fleet → Dock calibration</b>. The offset is stored per-dock in millimetres; the planner reads it on every approach. The default tolerance is ±4 mm — anything beyond ±12 mm fails the alignment check.",
  filters: [
    { id: "all",     label: "All",       count: 47, active: true },
    { id: "docs",    label: "Documents", count: 18, active: false },
    { id: "msgs",    label: "Messages",  count: 21, active: false },
    { id: "tickets", label: "Tickets",   count: 6,  active: false },
    { id: "code",    label: "Code",      count: 2,  active: false },
  ],
  results: [
    { src: "notion",     title: "Customer FAQ — <mark>Dock alignment offset</mark>",    snippet: "<mark>Dock alignment</mark> is calibrated at install. Customers can adjust the <mark>offset</mark> from Settings → Fleet → Dock calibration. Tolerances: ±4 mm nominal, ±12 mm fail.", meta: "Notion · Customer Success", when: "Updated 2 days ago" },
    { src: "zendesk",    title: "Ticket #4128 — \"Robot misses dock by ~8 mm\"",        snippet: "Customer reports persistent <mark>offset</mark> after building HVAC reflow. Resolution: re-ran dock calibration, set <mark>offset</mark> +6 mm on dock-04.",                          meta: "Zendesk · Resolved",        when: "5 days ago" },
    { src: "slack",      title: "#customers-northwind · dock recal thread",             snippet: "Was the <mark>offset</mark> stored per-dock or per-fleet? per-dock — the planner reads it on each approach.",                                                                        meta: "Slack · 22 replies",        when: "1 week ago" },
    { src: "github",     title: "moos-planner / dock_approach.cpp",                    snippet: "double <mark>dock_offset</mark> = dock.config().alignment_offset_mm(); // applied at approach() entry",                                                                              meta: "GitHub · main",             when: "3 weeks ago" },
    { src: "confluence", title: "Dock calibration procedure (rev 4)",                  snippet: "Step 6 — manually verify <mark>offset</mark> using laser jig; record value in dock config and recommit to fleet registry.",                                                          meta: "Confluence · Field Ops",    when: "1 month ago" },
  ],
};
