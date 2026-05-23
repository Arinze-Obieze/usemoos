export { googleDriveAdapter } from "./google-drive.js";
export { notionAdapter } from "./notion.js";
export { slackAdapter } from "./slack.js";
export { githubAdapter } from "./github.js";
export { jiraAdapter } from "./jira.js";
export { confluenceAdapter } from "./confluence.js";
export { linearAdapter } from "./linear.js";
export { zendeskAdapter } from "./zendesk.js";
export { asanaAdapter } from "./asana.js";
export { clickupAdapter } from "./clickup.js";
export { hubspotAdapter } from "./hubspot.js";
export { salesforceAdapter } from "./salesforce.js";
export { microsoftTeamsAdapter } from "./microsoft-teams.js";
export { sharepointAdapter } from "./sharepoint.js";
export { trelloAdapter } from "./trello.js";
export { dropboxAdapter } from "./dropbox.js";
export type { IntegrationAdapter, RawDocument, ProcessedChunk } from "./base.js";
export { freshnessScore } from "./base.js";

import { googleDriveAdapter } from "./google-drive.js";
import { notionAdapter } from "./notion.js";
import { slackAdapter } from "./slack.js";
import { githubAdapter } from "./github.js";
import { jiraAdapter } from "./jira.js";
import { confluenceAdapter } from "./confluence.js";
import { linearAdapter } from "./linear.js";
import { zendeskAdapter } from "./zendesk.js";
import { asanaAdapter } from "./asana.js";
import { clickupAdapter } from "./clickup.js";
import { hubspotAdapter } from "./hubspot.js";
import { salesforceAdapter } from "./salesforce.js";
import { microsoftTeamsAdapter } from "./microsoft-teams.js";
import { sharepointAdapter } from "./sharepoint.js";
import { trelloAdapter } from "./trello.js";
import { dropboxAdapter } from "./dropbox.js";
import type { IntegrationType } from "@usemoos/types";
import type { IntegrationAdapter } from "./base.js";

export const ADAPTERS: Partial<Record<IntegrationType, IntegrationAdapter>> = {
  google_drive: googleDriveAdapter,
  notion: notionAdapter,
  slack: slackAdapter,
  github: githubAdapter,
  jira: jiraAdapter,
  confluence: confluenceAdapter,
  linear: linearAdapter,
  zendesk: zendeskAdapter,
  asana: asanaAdapter,
  clickup: clickupAdapter,
  hubspot: hubspotAdapter,
  salesforce: salesforceAdapter,
  microsoft_teams: microsoftTeamsAdapter,
  sharepoint: sharepointAdapter,
  trello: trelloAdapter,
  dropbox: dropboxAdapter,
};
