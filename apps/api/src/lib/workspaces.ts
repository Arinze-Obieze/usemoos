import { eq, type getDb, workspaces } from "@usemoos/db";
import { v4 as uuidv4 } from "uuid";

type Db = ReturnType<typeof getDb>;

function slugFromOrgId(orgId: string) {
  return `ws-${orgId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

export async function ensureWorkspace(db: Db, orgId: string) {
  const [existing] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.clerk_org_id, orgId));

  if (existing) return existing;

  const [created] = await db
    .insert(workspaces)
    .values({
      id: uuidv4(),
      clerk_org_id: orgId,
      name: "My Workspace",
      slug: slugFromOrgId(orgId),
    })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.clerk_org_id, orgId));

  if (!workspace) throw new Error("Could not provision workspace");
  return workspace;
}
