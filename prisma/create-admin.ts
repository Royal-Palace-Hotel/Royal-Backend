import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  console.log('🔐 Create First Admin Account')
  console.log('================================\n')

  try {
    // Check if admin already exists
    const existingAdmins = await prisma.adminUser.count()
    if (existingAdmins > 0) {
      console.log('⚠️  Admin accounts already exist in the database.')
      console.log('If you need to create additional admins, use the registration endpoint with the invite code.')
      process.exit(0)
    }

    // Get admin details
    const email = await question('Enter admin email: ')
    const password = await question('Enter admin password (min 6 characters): ')
    const role = await question('Enter role (admin/staff, default: admin): ') || 'admin'

    // Validate
    if (!email || !password) {
      console.log('❌ Email and password are required')
      process.exit(1)
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters')
      process.exit(1)
    }

    if (role !== 'admin' && role !== 'staff') {
      console.log('❌ Role must be either "admin" or "staff"')
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin
    const admin = await prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    })

    console.log('\n✅ Admin account created successfully!')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   ID: ${admin.id}`)
    console.log('\n⚠️  Please save these credentials securely.')
    console.log('   You can now login using the /api/auth/login endpoint.')
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

main()
