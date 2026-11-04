
import { auth } from "@/auth";
import { getUserRole } from "@/lib/access";
import { redirect } from "next/navigation";
import TechnicianDashboard from "../TechnicianDashboard";

export default async function TechnicianDashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const role = getUserRole(session.user.email);

  if (role !== "technician") {
    redirect(role === "admin" ? "/admin" : "/unauthorized");
  }

  return (
    <TechnicianDashboard
      email={session.user.email}
      name={session.user.name ?? session.user.email}
    />
  );
}
