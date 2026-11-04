
export type UserRole = "admin" | "technician" | "user";

const ADMIN_EMAILS = [
  "wahyu.sandi@grahasurvei.com",
];

const TECHNICIAN_EMAILS = [
  "naomi.manurung@grahasurvei.com",
  "fajar.chan@grahasurvei.com",
];

export function getUserRole(email?: string | null): UserRole {
  const normalizedEmail = email?.trim().toLowerCase();

  if (ADMIN_EMAILS.includes(normalizedEmail ?? "")) {
    return "admin";
  }

  if (TECHNICIAN_EMAILS.includes(normalizedEmail ?? "")) {
    return "technician";
  }

  return "user";
}
