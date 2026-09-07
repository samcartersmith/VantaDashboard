import type { Person, Team } from "./types";

// The signed-in identity used for the "My actions" role view.
export const CURRENT_USER_ID = "usr_alex";

export const PEOPLE: Person[] = [
  { id: "usr_alex", name: "Alex Rivera", role: "Security Analyst", initials: "AR" },
  { id: "usr_priya", name: "Priya Shah", role: "DevOps Lead", initials: "PS" },
  { id: "usr_marcus", name: "Marcus Cole", role: "IT Admin", initials: "MC" },
  { id: "usr_dana", name: "Dana Kim", role: "HR Operations", initials: "DK" },
  { id: "usr_leah", name: "Leah Osei", role: "Legal Counsel", initials: "LO" },
  { id: "usr_sam", name: "Sam Carter", role: "CISO", initials: "SC" },
  { id: "usr_wei", name: "Wei Zhang", role: "Compliance Manager", initials: "WZ" },
];

export const TEAMS: Team[] = [
  { id: "team_devops", name: "DevOps", initials: "DO" },
  { id: "team_security", name: "Security", initials: "SE" },
  { id: "team_hr", name: "HR Ops", initials: "HR" },
  { id: "team_legal", name: "Legal", initials: "LG" },
  { id: "team_it", name: "IT", initials: "IT" },
];

const peopleById = new Map(PEOPLE.map((p) => [p.id, p]));
const teamsById = new Map(TEAMS.map((t) => [t.id, t]));

export function personById(id: string | null): Person | undefined {
  return id ? peopleById.get(id) : undefined;
}

export function teamById(id: string | null): Team | undefined {
  return id ? teamsById.get(id) : undefined;
}

export function assigneeLabel(assignee: {
  type: string;
  id: string | null;
}): string {
  if (assignee.type === "UNASSIGNED" || !assignee.id) return "Unassigned";
  if (assignee.type === "TEAM") return teamById(assignee.id)?.name ?? "Team";
  return personById(assignee.id)?.name ?? "User";
}

export function assigneeInitials(assignee: {
  type: string;
  id: string | null;
}): string | null {
  if (assignee.type === "UNASSIGNED" || !assignee.id) return null;
  if (assignee.type === "TEAM") return teamById(assignee.id)?.initials ?? "T";
  return personById(assignee.id)?.initials ?? "U";
}
