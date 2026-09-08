import type {
  ActionableItem,
  Domain,
  Framework,
  RemediationPayload,
  Severity,
  Status,
} from "./types";

// The upcoming audit date drives the audit-urgency scoring across the app.
export const AUDIT_DATE = iso(14); // SOC 2 audit in 14 days

function iso(daysFromNow: number, hour = 9): string {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

let counter = 0;
function mk(
  partial: Omit<ActionableItem, "actionable_item_id" | "activity"> &
    Partial<Pick<ActionableItem, "activity">>
): ActionableItem {
  counter += 1;
  const id = `act_${(0x8f93a100 + counter).toString(16)}`;
  return {
    activity: [
      {
        ts: partial.created_at,
        actor: "Vanta Action Engine",
        text: "Item auto-generated from a failed platform check.",
      },
    ],
    ...partial,
    actionable_item_id: id,
  };
}

function remediation(
  type: RemediationPayload["type"],
  label: string,
  entity: string
): RemediationPayload {
  return {
    type,
    label,
    action_url: `https://app.vanta.com/${entity}`,
    deep_link_api: `/api/v1/${entity}`,
  };
}

interface Spec {
  domain: Domain;
  entity: string;
  title: string;
  description: string;
  severity: Severity;
  audit_blocking: boolean;
  framework: Framework;
  assignee: ActionableItem["assignee"];
  due: number; // days from now
  created: number; // days from now (negative = past)
  status?: Status;
  remType?: RemediationPayload["type"];
  remLabel?: string;
  snoozeNote?: string;
  snoozeDays?: number;
}

const U = (id: string) => ({ type: "USER" as const, id });
const T = (id: string) => ({ type: "TEAM" as const, id });
const NONE = { type: "UNASSIGNED" as const, id: null };

const specs: Spec[] = [
  // ---- CRITICAL / audit-blocking ----
  {
    domain: "TESTS",
    entity: "tests/chk_9921",
    title: "S3 bucket 'pci-cardholder-logs' has public read access",
    description:
      "The S3 bucket storing tokenized cardholder transaction logs has a bucket policy granting public read (s3:GetObject) to all principals. This exposes PCI-scoped data and fails PCI DSS Req. 1.3 network segmentation controls.",
    severity: "CRITICAL",
    audit_blocking: true,
    framework: "PCI_DSS",
    assignee: T("team_devops"),
    due: 2,
    created: -1,
    remType: "IN_LINE_ACTION",
    remLabel: "Auto-remediate bucket policy",
  },
  {
    domain: "TESTS",
    entity: "tests/chk_7740",
    title: "Production RDS instance is not encrypted at rest",
    description:
      "RDS instance 'prod-billing-db' storing customer PII and payment metadata has storage encryption disabled, failing SOC 2 CC6.1 and PCI DSS Req. 3.5.",
    severity: "CRITICAL",
    audit_blocking: true,
    framework: "PCI_DSS",
    assignee: U("usr_priya"),
    due: 3,
    created: -2,
    remType: "EXTERNAL_LINK",
    remLabel: "Open remediation runbook",
  },
  {
    domain: "PEOPLE",
    entity: "people/off_3310",
    title: "Offboarded employee still has active Okta + AWS access",
    description:
      "J. Nolan was marked terminated 6 days ago in the HRIS, but retains active Okta SSO and an AWS IAM user with prod access. Fails SOC 2 CC6.2 timely deprovisioning.",
    severity: "CRITICAL",
    audit_blocking: true,
    framework: "SOC2",
    assignee: T("team_hr"),
    due: 1,
    created: -3,
    remType: "IN_LINE_ACTION",
    remLabel: "Revoke all access",
  },
  {
    domain: "ACCESS_REVIEWS",
    entity: "access/rev_5501",
    title: "Access review overdue: production database admins",
    description:
      "The quarterly access review for the 'Production DB Admins' group (11 members) is 4 days overdue. Required for SOC 2 CC6.3 least-privilege attestation.",
    severity: "HIGH",
    audit_blocking: true,
    framework: "SOC2",
    assignee: U("usr_alex"),
    due: 0,
    created: -10,
    remType: "IN_LINE_ACTION",
    remLabel: "Start access review",
  },
  {
    domain: "VENDOR_RISK",
    entity: "vendors/ven_8820",
    title: "Sub-processor DPA missing for analytics vendor",
    description:
      "Amplitude processes EU end-user event data but no signed Data Processing Agreement is on file. Fails GDPR Art. 28 sub-processor obligations.",
    severity: "HIGH",
    audit_blocking: true,
    framework: "GDPR",
    assignee: T("team_legal"),
    due: 4,
    created: -5,
    remType: "EXTERNAL_LINK",
    remLabel: "Request DPA",
  },
  {
    domain: "TESTS",
    entity: "tests/chk_6104",
    title: "MFA not enforced for 3 admin console accounts",
    description:
      "Three Google Workspace super-admin accounts do not have MFA enforced, failing SOC 2 CC6.1 and PCI DSS Req. 8.4.",
    severity: "HIGH",
    audit_blocking: true,
    framework: "SOC2",
    assignee: U("usr_marcus"),
    due: 2,
    created: -2,
    remType: "IN_LINE_ACTION",
    remLabel: "Enforce MFA policy",
  },

  // ---- HIGH ----
  {
    domain: "QUESTIONNAIRES",
    entity: "questionnaires/saq_2201",
    title: "Merchant SAQ-D questionnaire section 8 incomplete",
    description:
      "The PCI DSS Self-Assessment Questionnaire (SAQ-D) 'Identify and Authenticate Access' section is 60% complete and due before the assessor engagement.",
    severity: "HIGH",
    audit_blocking: true,
    framework: "PCI_DSS",
    assignee: U("usr_alex"),
    due: 6,
    created: -4,
    remType: "EXTERNAL_LINK",
    remLabel: "Continue questionnaire",
  },
  {
    domain: "TESTS",
    entity: "tests/chk_4412",
    title: "CloudTrail logging disabled in us-west-2",
    description:
      "AWS CloudTrail is not enabled in the us-west-2 region, creating an audit-log gap. Fails SOC 2 CC7.2 monitoring controls.",
    severity: "HIGH",
    audit_blocking: false,
    framework: "SOC2",
    assignee: T("team_devops"),
    due: 5,
    created: -3,
    remType: "IN_LINE_ACTION",
    remLabel: "Enable CloudTrail",
  },
  {
    domain: "VENDOR_RISK",
    entity: "vendors/ven_3390",
    title: "Critical vendor SOC 2 report expired",
    description:
      "The SOC 2 Type II report for payment processor Stripe on file expired 20 days ago. A current report is required for vendor risk attestation.",
    severity: "HIGH",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_wei"),
    due: 8,
    created: -7,
    remType: "EXTERNAL_LINK",
    remLabel: "Upload current report",
  },
  {
    domain: "PEOPLE",
    entity: "people/sec_1120",
    title: "6 employees have not completed security awareness training",
    description:
      "Annual security awareness training is incomplete for 6 employees past the 30-day onboarding deadline. Required for SOC 2 CC1.4.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "SOC2",
    assignee: T("team_hr"),
    due: 9,
    created: -6,
    remType: "IN_LINE_ACTION",
    remLabel: "Send training reminder",
  },
  {
    domain: "ACCESS_REVIEWS",
    entity: "access/rev_7788",
    title: "GitHub org owner access review pending",
    description:
      "Semi-annual review of GitHub organization owners (5 members) is due. Confirms least-privilege for source-code access under SOC 2 CC6.3.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_alex"),
    due: 7,
    created: -2,
    remType: "IN_LINE_ACTION",
    remLabel: "Start access review",
  },
  {
    domain: "RISK_REGISTER",
    entity: "risk/rsk_2044",
    title: "Untreated risk: single-region disaster recovery",
    description:
      "Risk register entry 'No cross-region DR for primary datastore' has no treatment plan or owner assigned. Impacts availability commitments (SOC 2 A1.2).",
    severity: "HIGH",
    audit_blocking: false,
    framework: "SOC2",
    assignee: NONE,
    due: 12,
    created: -8,
    remType: "EXTERNAL_LINK",
    remLabel: "Assign treatment plan",
  },

  // ---- current-user heavy (My actions) ----
  {
    domain: "TESTS",
    entity: "tests/chk_5567",
    title: "Security group allows 0.0.0.0/0 on port 22 (SSH)",
    description:
      "Security group 'sg-bastion' permits inbound SSH from any IP. Restrict to the corporate VPN CIDR to satisfy SOC 2 CC6.6.",
    severity: "HIGH",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_alex"),
    due: 3,
    created: -1,
    remType: "IN_LINE_ACTION",
    remLabel: "Restrict inbound rule",
  },
  {
    domain: "POLICIES",
    entity: "policies/pol_1002",
    title: "Information Security Policy annual review due",
    description:
      "The Information Security Policy was last approved 358 days ago and requires annual management review and re-approval per SOC 2 CC1.1.",
    severity: "LOW",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_alex"),
    due: 21,
    created: -5,
    remType: "IN_LINE_ACTION",
    remLabel: "Review and approve",
  },
  {
    domain: "VENDOR_RISK",
    entity: "vendors/ven_9910",
    title: "New vendor 'SendGrid' pending security review",
    description:
      "SendGrid was added as an email sub-processor and requires an inherent-risk assessment before production use.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "GDPR",
    assignee: U("usr_alex"),
    due: 10,
    created: -3,
    remType: "EXTERNAL_LINK",
    remLabel: "Start vendor review",
  },

  // ---- IN_PROGRESS ----
  {
    domain: "TESTS",
    entity: "tests/chk_3301",
    title: "EBS volumes without encryption detected (4)",
    description:
      "Four EBS volumes in prod lack encryption at rest. Snapshot-and-replace remediation is underway.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "PCI_DSS",
    assignee: U("usr_priya"),
    due: 6,
    created: -4,
    status: "IN_PROGRESS",
    remType: "IN_LINE_ACTION",
    remLabel: "View remediation",
  },
  {
    domain: "ACCESS_REVIEWS",
    entity: "access/rev_9002",
    title: "Salesforce admin access review in progress",
    description:
      "Reviewing 8 Salesforce administrators for least-privilege. 5 of 8 attestations complete.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_wei"),
    due: 4,
    created: -6,
    status: "IN_PROGRESS",
    remType: "IN_LINE_ACTION",
    remLabel: "Continue review",
  },
  {
    domain: "POLICIES",
    entity: "policies/pol_2210",
    title: "Data Retention Policy needs GDPR update",
    description:
      "The Data Retention Policy must document lawful basis and retention periods for EU personal data per GDPR Art. 5. Draft in review with Legal.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "GDPR",
    assignee: U("usr_leah"),
    due: 11,
    created: -9,
    status: "IN_PROGRESS",
    remType: "EXTERNAL_LINK",
    remLabel: "Open draft",
  },

  // ---- SNOOZED ----
  {
    domain: "TESTS",
    entity: "tests/chk_8890",
    title: "Password policy allows 8-character minimum",
    description:
      "The identity provider password policy permits 8-character passwords; PCI DSS Req. 8.3.6 recommends 12. Change scheduled for next maintenance window.",
    severity: "LOW",
    audit_blocking: false,
    framework: "PCI_DSS",
    assignee: U("usr_marcus"),
    due: 18,
    created: -12,
    status: "SNOOZED",
    snoozeNote: "Bundled with the Q4 IdP configuration change window.",
    snoozeDays: 10,
    remType: "IN_LINE_ACTION",
    remLabel: "Update password policy",
  },
  {
    domain: "VENDOR_RISK",
    entity: "vendors/ven_4455",
    title: "Low-risk vendor questionnaire outstanding",
    description:
      "Figma questionnaire pending; classified low inherent risk (no customer data). Deferred pending vendor response.",
    severity: "LOW",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_wei"),
    due: 25,
    created: -15,
    status: "SNOOZED",
    snoozeNote: "Awaiting vendor security contact; no PII exposure.",
    snoozeDays: 14,
    remType: "EXTERNAL_LINK",
    remLabel: "Send reminder",
  },

  // ---- RESOLVED (recent, for velocity metrics) ----
  {
    domain: "TESTS",
    entity: "tests/chk_1180",
    title: "Public snapshot of prod database made private",
    description:
      "An RDS snapshot shared publicly was set to private. Verified by the next platform check.",
    severity: "CRITICAL",
    audit_blocking: true,
    framework: "PCI_DSS",
    assignee: U("usr_priya"),
    due: -1,
    created: -4,
    status: "RESOLVED",
    remType: "IN_LINE_ACTION",
    remLabel: "View resolution",
  },
  {
    domain: "PEOPLE",
    entity: "people/off_2201",
    title: "Contractor access revoked on end date",
    description:
      "Contractor R. Vega access across Okta, AWS, and GitHub deprovisioned on schedule.",
    severity: "HIGH",
    audit_blocking: false,
    framework: "SOC2",
    assignee: T("team_hr"),
    due: -2,
    created: -5,
    status: "RESOLVED",
    remType: "IN_LINE_ACTION",
    remLabel: "View resolution",
  },
  {
    domain: "ACCESS_REVIEWS",
    entity: "access/rev_1155",
    title: "AWS IAM access review completed",
    description:
      "Quarterly IAM access review completed; 3 over-provisioned roles right-sized.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_alex"),
    due: -3,
    created: -9,
    status: "RESOLVED",
    remType: "IN_LINE_ACTION",
    remLabel: "View resolution",
  },
  {
    domain: "POLICIES",
    entity: "policies/pol_3301",
    title: "Incident Response Plan re-approved",
    description:
      "Annual review of the Incident Response Plan completed and approved by the CISO.",
    severity: "LOW",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_sam"),
    due: -1,
    created: -6,
    status: "RESOLVED",
    remType: "IN_LINE_ACTION",
    remLabel: "View resolution",
  },
  {
    domain: "TESTS",
    entity: "tests/chk_2290",
    title: "Endpoint disk encryption enabled on 4 laptops",
    description:
      "FileVault was enforced on 4 non-compliant macOS endpoints via MDM.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "SOC2",
    assignee: T("team_it"),
    due: -2,
    created: -4,
    status: "RESOLVED",
    remType: "IN_LINE_ACTION",
    remLabel: "View resolution",
  },

  // ---- more OPEN spread across domains/frameworks ----
  {
    domain: "TESTS",
    entity: "tests/chk_6612",
    title: "TLS 1.0/1.1 still enabled on customer API endpoint",
    description:
      "The public API load balancer accepts TLS 1.0/1.1. Disable to meet PCI DSS Req. 4.2.1 strong cryptography.",
    severity: "HIGH",
    audit_blocking: false,
    framework: "PCI_DSS",
    assignee: T("team_devops"),
    due: 7,
    created: -2,
    remType: "IN_LINE_ACTION",
    remLabel: "Update TLS policy",
  },
  {
    domain: "VENDOR_RISK",
    entity: "vendors/ven_7712",
    title: "Vendor breach disclosed: assess exposure",
    description:
      "A monitoring vendor disclosed a security incident. Assess whether Vanta data was in scope and document the outcome.",
    severity: "HIGH",
    audit_blocking: false,
    framework: "GDPR",
    assignee: NONE,
    due: 5,
    created: -1,
    remType: "EXTERNAL_LINK",
    remLabel: "Open assessment",
  },
  {
    domain: "QUESTIONNAIRES",
    entity: "questionnaires/sec_9931",
    title: "Prospect security questionnaire due (Enterprise deal)",
    description:
      "A 140-question enterprise security questionnaire is due in support of an active sales deal.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_wei"),
    due: 4,
    created: -3,
    remType: "EXTERNAL_LINK",
    remLabel: "Continue questionnaire",
  },
  {
    domain: "RISK_REGISTER",
    entity: "risk/rsk_5510",
    title: "Risk treatment overdue: third-party library CVEs",
    description:
      "The accepted-risk review date for known dependency CVEs has passed; re-evaluate treatment.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_priya"),
    due: 9,
    created: -4,
    remType: "EXTERNAL_LINK",
    remLabel: "Review risk",
  },
  {
    domain: "PEOPLE",
    entity: "people/bg_4420",
    title: "Background check missing for 2 new hires",
    description:
      "Two employees started without a completed background check on file, required by the HR security policy (SOC 2 CC1.4).",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "SOC2",
    assignee: T("team_hr"),
    due: 8,
    created: -5,
    remType: "EXTERNAL_LINK",
    remLabel: "Initiate check",
  },
  {
    domain: "POLICIES",
    entity: "policies/pol_4412",
    title: "Acceptable Use Policy unacknowledged by 9 staff",
    description:
      "Nine employees have not acknowledged the current Acceptable Use Policy revision.",
    severity: "LOW",
    audit_blocking: false,
    framework: "SOC2",
    assignee: T("team_hr"),
    due: 15,
    created: -7,
    remType: "IN_LINE_ACTION",
    remLabel: "Send for acknowledgement",
  },
  {
    domain: "TESTS",
    entity: "tests/chk_7003",
    title: "Automated backups not verified for billing datastore",
    description:
      "No successful restore test recorded for the billing datastore in 90 days. Availability control SOC 2 A1.2.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "SOC2",
    assignee: T("team_devops"),
    due: 13,
    created: -6,
    remType: "IN_LINE_ACTION",
    remLabel: "Schedule restore test",
  },
  {
    domain: "ACCESS_REVIEWS",
    entity: "access/rev_3320",
    title: "Datadog access review pending",
    description:
      "Review 14 Datadog users for appropriate access to logging that may contain PII.",
    severity: "LOW",
    audit_blocking: false,
    framework: "GDPR",
    assignee: NONE,
    due: 16,
    created: -3,
    remType: "IN_LINE_ACTION",
    remLabel: "Start access review",
  },
  {
    domain: "VENDOR_RISK",
    entity: "vendors/ven_5540",
    title: "HIPAA BAA missing for cloud storage vendor",
    description:
      "A vendor handling limited health-adjacent data lacks a Business Associate Agreement (HIPAA).",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "HIPAA",
    assignee: T("team_legal"),
    due: 11,
    created: -5,
    remType: "EXTERNAL_LINK",
    remLabel: "Request BAA",
  },
  {
    domain: "TESTS",
    entity: "tests/chk_8125",
    title: "Root account access key is active",
    description:
      "The AWS root account has an active access key. Delete it to meet SOC 2 CC6.1 and PCI DSS Req. 8.2.",
    severity: "CRITICAL",
    audit_blocking: true,
    framework: "PCI_DSS",
    assignee: T("team_devops"),
    due: 1,
    created: -1,
    remType: "IN_LINE_ACTION",
    remLabel: "Delete root access key",
  },
  {
    domain: "QUESTIONNAIRES",
    entity: "questionnaires/gdpr_1140",
    title: "GDPR data-mapping questionnaire incomplete",
    description:
      "The records-of-processing (RoPA) data-mapping questionnaire required under GDPR Art. 30 is 40% complete.",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "GDPR",
    assignee: U("usr_leah"),
    due: 12,
    created: -4,
    remType: "EXTERNAL_LINK",
    remLabel: "Continue mapping",
  },
  {
    domain: "PEOPLE",
    entity: "people/mdm_2255",
    title: "3 laptops missing endpoint protection agent",
    description:
      "Three enrolled macOS devices are missing the endpoint protection agent required by policy (SOC 2 CC6.8).",
    severity: "HIGH",
    audit_blocking: false,
    framework: "SOC2",
    assignee: T("team_it"),
    due: 6,
    created: -2,
    remType: "IN_LINE_ACTION",
    remLabel: "Push agent via MDM",
  },
  {
    domain: "RISK_REGISTER",
    entity: "risk/rsk_8890",
    title: "Annual risk assessment sign-off pending",
    description:
      "The enterprise risk assessment awaits executive sign-off before the audit window.",
    severity: "MEDIUM",
    audit_blocking: true,
    framework: "SOC2",
    assignee: U("usr_sam"),
    due: 10,
    created: -6,
    remType: "EXTERNAL_LINK",
    remLabel: "Review and sign off",
  },
  {
    domain: "POLICIES",
    entity: "policies/pol_5523",
    title: "Vendor Management Policy missing",
    description:
      "No formal Vendor Management Policy exists to govern third-party risk (SOC 2 CC3.2).",
    severity: "MEDIUM",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_wei"),
    due: 20,
    created: -8,
    remType: "IN_LINE_ACTION",
    remLabel: "Create from template",
  },
  {
    domain: "TESTS",
    entity: "tests/chk_9440",
    title: "Cardholder data found in application logs",
    description:
      "A log scanner detected unmasked PAN-like patterns in application logs, a PCI DSS Req. 3.4 violation.",
    severity: "CRITICAL",
    audit_blocking: true,
    framework: "PCI_DSS",
    assignee: T("team_devops"),
    due: 2,
    created: -1,
    remType: "IN_LINE_ACTION",
    remLabel: "Enable log masking",
  },
  {
    domain: "VENDOR_RISK",
    entity: "vendors/ven_6601",
    title: "Vendor risk reassessment overdue (annual)",
    description:
      "The annual reassessment for cloud host GCP is 12 days overdue.",
    severity: "LOW",
    audit_blocking: false,
    framework: "SOC2",
    assignee: U("usr_wei"),
    due: 3,
    created: -7,
    remType: "EXTERNAL_LINK",
    remLabel: "Start reassessment",
  },
];

export const SEED_ITEMS: ActionableItem[] = specs.map((s) =>
  mk({
    domain_source: s.domain,
    source_entity_id: s.entity.split("/")[1],
    title: s.title,
    description: s.description,
    severity: s.severity,
    audit_blocking: s.audit_blocking,
    framework: s.framework,
    assignee: s.assignee,
    due_date: iso(s.due),
    status: s.status ?? "OPEN",
    created_at: iso(s.created),
    remediation_payload: remediation(
      s.remType ?? "IN_LINE_ACTION",
      s.remLabel ?? "Remediate",
      s.entity
    ),
    ...(s.status === "SNOOZED"
      ? {
          snooze: {
            until: iso(s.snoozeDays ?? 7),
            note: s.snoozeNote ?? "Deferred.",
          },
        }
      : {}),
  })
);
