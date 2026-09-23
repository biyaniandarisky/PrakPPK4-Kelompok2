import { prisma } from "@/lib/prisma";

export default async function Home() {
  const data = await prisma.user.findMany();

  return (
    <main>
      <h1>Data User</h1>

      {data.map((user) => (
        <div key={user.id}>
          {user.nama}
        </div>
      ))}
    </main>
  );
}