import { auth, assignRoleToUser } from "@/lib/auth";
import { createDb } from "@/lib/db";
import { roles, userRoles } from "@/lib/schema";
import { ROLES } from "@/lib/permissions";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }

  const db = createDb();

  const emperorRole = await db.query.roles.findFirst({
    where: eq(roles.name, ROLES.EMPEROR),
    with: {
      userRoles: true,
    },
  });

  if (emperorRole && emperorRole.userRoles.length > 0) {
    return Response.json({ error: "Owner already exists" }, { status: 400 });
  }

  try {
    const currentUserRole = await db.query.userRoles.findFirst({
      where: eq(userRoles.userId, session.user.id),
      with: {
        role: true,
      },
    });

    if (currentUserRole?.role.name === ROLES.EMPEROR) {
      return Response.json({ message: "You are already the Owner" });
    }

    let roleId = emperorRole?.id;
    if (!roleId) {
      const [newRole] = await db.insert(roles)
        .values({
          name: ROLES.EMPEROR,
          description: "Owner",
        })
        .returning({ id: roles.id });
      roleId = newRole.id;
    }

    await assignRoleToUser(db, session.user.id, roleId);

    return Response.json({ message: "You are now the Owner" });
  } catch (error) {
    console.error("Failed to initialize owner:", error);
    return Response.json(
      { error: "Failed to initialize Owner" },
      { status: 500 }
    );
  }
} 