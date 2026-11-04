
import { auth } from "@/auth";
import { getUserRole } from "@/lib/access";
import { redirect } from "next/navigation";
import TechnicianTasks from "../TechnicianTasks";

export default async function TechnicianTasksPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const role = getUserRole(session.user.email);

  if (role !== "technician") {
    redirect(role === "admin" ? "/admin" : "/unauthorized");
  }

  return (
    <TechnicianTasks
      email={session.user.email}
      name={session.user.name ?? session.user.email}
    />
  );
}
