
import { auth } from "@/auth";
import { getUserRole } from "@/lib/access";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const role = getUserRole(session.user.email);

  if (role !== "admin") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
