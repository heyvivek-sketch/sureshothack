import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils/password';

const email = process.argv[2]?.toLowerCase().trim();
const password = process.argv[3];
const fullName = process.argv.slice(4).join(' ').trim() || 'Administrator';

if (!email || !password) {
  console.error('Usage: npm run admin:create -- admin@example.com StrongPassword "Admin Name"');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

async function main() {
  const hashedPassword = await hashPassword(password);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, fullName, role: 'ADMIN' },
    create: { email, fullName, password: hashedPassword, role: 'ADMIN' },
    select: { id: true, email: true, fullName: true, role: true },
  });
  console.log(`Admin ready: ${admin.email} (${admin.role})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
