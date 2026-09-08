export type Domain =
  | "TESTS"
  | "ACCESS_REVIEWS"
  | "VENDOR_RISK"
  | "POLICIES"
  | "PEOPLE"
  | "QUESTIONNAIRES"
  | "RISK_REGISTER";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type Status =
  | "OPEN"
  | "IN_PROGRESS"
  | "SNOOZED"
  | "RESOLVED"
  | "DISMISSED";

export type Framework = "SOC2" | "PCI_DSS" | "GDPR" | "HIPAA";

export type RemediationType =
  | "IN_LINE_ACTION"
  | "EXTERNAL_LINK"
  | "SLACK_APPROVAL";

export type Role = "MY_ACTIONS" | "PROGRAM_QUEUE" | "LEADERSHIP";

export interface Assignee {
  type: "USER" | "TEAM" | "UNASSIGNED";
  id: string | null;
}

export interface ActivityEntry {
  ts: string;
  actor: string;
  text: string;
}

export interface RemediationPayload {
  type: RemediationType;
  label: string;
  action_url: string;
  deep_link_api: string;
}

export interface ActionableItem {
  actionable_item_id: string;
  domain_source: Domain;
  source_entity_id: string;
  title: string;
  description: string;
  severity: Severity;
  audit_blocking: boolean;
  framework: Framework;
  assignee: Assignee;
  due_date: string; // ISO
  status: Status;
  remediation_payload: RemediationPayload;
  created_at: string; // ISO
  snooze?: { until: string; note: string };
  activity: ActivityEntry[];
}

export interface Person {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface Team {
  id: string;
  name: string;
  initials: string;
}
