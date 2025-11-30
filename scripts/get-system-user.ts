import { prisma } from '../src/server/db/client';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'system@agents-playbook.app' }
  });

  console.log(user?.id || 'NOT_FOUND');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
