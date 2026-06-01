import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RagDashboard } from "@/components/RagDashboard";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const documents = await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      sourceType: true,
      status: true,
      createdAt: true,
    },
    take: 12,
  });

  return (
    <RagDashboard
      initialDocuments={documents.map((document) => ({
        ...document,
        createdAt: document.createdAt.toISOString(),
      }))}
    />
  );
}
