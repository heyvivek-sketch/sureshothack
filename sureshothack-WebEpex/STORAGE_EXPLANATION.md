# How User Authentication Works (Without Database)

## 🔍 Current Implementation: In-Memory Storage

### How It Works

Right now, we're using **in-memory storage** - a simple JavaScript array that stores users in the server's memory.

### The Flow

#### 1. **User Signs Up** (`/api/auth/signup`)

```typescript
// In lib/services/userService.ts
const users: User[] = [];  // ← Empty array in memory

export const createUser = async (input: CreateUserInput) => {
  // Check if email already exists
  const existingUser = users.find((u) => 
    u.email.toLowerCase() === input.email.toLowerCase()
  );
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(input.password);

  // Create new user object
  const newUser: User = {
    id: uuidv4(),                    // Generate unique ID
    email: input.email.toLowerCase(),
    fullName: input.fullName.trim(),
    password: hashedPassword,        // Stored as hash, never plain text
    createdAt: new Date(),
  };

  // Add to array
  users.push(newUser);  // ← User stored in memory array
  
  return userWithoutPassword;
};
```

**What Happens:**
- User fills signup form
- Backend receives email, name, password
- Checks if email exists in `users` array
- If not, hashes password and adds user to array
- Returns JWT token

#### 2. **User Logs In** (`/api/auth/signin`)

```typescript
// In app/api/auth/signin/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json(); // { email, password }
  
  // Step 1: Find user by email in the array
  const user = await findUserByEmail(body.email);
  // This searches: users.find(u => u.email === email)
  
  if (!user) {
    // User not found in array
    return { success: false, message: 'Invalid email or password' };
  }

  // Step 2: Verify password
  const isPasswordValid = await verifyUserPassword(user, body.password);
  // Compares: bcrypt.compare(password, user.password)
  
  if (!isPasswordValid) {
    return { success: false, message: 'Invalid email or password' };
  }

  // Step 3: Generate JWT token
  const token = generateToken({ userId: user.id, email: user.email });
  
  return { success: true, token, user };
}
```

**What Happens:**
- User fills login form
- Backend searches `users` array for matching email
- If found, compares password hash
- If valid, returns JWT token

### Visual Flow

```
Signup Flow:
┌─────────────┐
│ User Signs  │
│   Up        │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Check if email  │
│ exists in array │
└──────┬──────────┘
       │
       ▼ (if not exists)
┌─────────────────┐
│ Hash password   │
│ with bcrypt     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Add to users[]  │ ← Stored in memory
│ array           │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Return JWT     │
│ token          │
└─────────────────┘

Login Flow:
┌─────────────┐
│ User Logs   │
│   In        │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Search users[]  │
│ for email       │
└──────┬──────────┘
       │
       ▼ (found?)
┌─────────────────┐
│ Compare password│
│ hash            │
└──────┬──────────┘
       │
       ▼ (valid?)
┌─────────────────┐
│ Return JWT     │
│ token          │
└─────────────────┘
```

## ⚠️ Critical Limitations

### Problem 1: Data Loss on Server Restart
```typescript
const users: User[] = [];  // ← Empty array
```

**What happens:**
- Users are stored in server memory
- When server restarts → array is empty → all users lost
- In serverless (Vercel) → each function call might have empty array

### Problem 2: Not Shared Across Instances
- Multiple server instances = multiple arrays
- User created on instance A won't exist on instance B
- Not suitable for production

### Problem 3: No Persistence
- Close server → data gone
- Deploy new version → data gone
- Serverless cold start → data gone

## ✅ Current Status

**Works For:**
- ✅ Development/testing
- ✅ Single server instance
- ✅ Quick prototypes

**Doesn't Work For:**
- ❌ Production
- ❌ Multiple users
- ❌ Data persistence
- ❌ Serverless deployments

## 🔧 Solution: Add a Database

### Option 1: Vercel Postgres (Recommended for Vercel)

```typescript
// Install: npm install @vercel/postgres
import { sql } from '@vercel/postgres';

export const createUser = async (input: CreateUserInput) => {
  // Check if user exists
  const existing = await sql`
    SELECT id FROM users WHERE email = ${input.email}
  `;
  
  if (existing.rows.length > 0) {
    throw new Error('User already exists');
  }

  // Create user
  const hashedPassword = await hashPassword(input.password);
  const result = await sql`
    INSERT INTO users (email, full_name, password)
    VALUES (${input.email}, ${input.fullName}, ${hashedPassword})
    RETURNING id, email, full_name
  `;
  
  return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  return result.rows[0] || null;
};
```

### Option 2: MongoDB Atlas

```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('sureshot');
const users = db.collection('users');

export const createUser = async (input: CreateUserInput) => {
  const hashedPassword = await hashPassword(input.password);
  const result = await users.insertOne({
    email: input.email.toLowerCase(),
    fullName: input.fullName,
    password: hashedPassword,
    createdAt: new Date(),
  });
  return result;
};
```

### Option 3: Supabase

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const createUser = async (input: CreateUserInput) => {
  const hashedPassword = await hashPassword(input.password);
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: input.email,
      full_name: input.fullName,
      password: hashedPassword,
    })
    .select();
  return data;
};
```

## 📊 Comparison

| Feature | In-Memory Array | Database |
|---------|----------------|----------|
| Persistence | ❌ Lost on restart | ✅ Permanent |
| Multiple Instances | ❌ Not shared | ✅ Shared |
| Production Ready | ❌ No | ✅ Yes |
| Scalability | ❌ Limited | ✅ Unlimited |
| Data Safety | ❌ Risky | ✅ Safe |

## 🎯 Summary

**How login works now:**
1. User submits email/password
2. Backend searches `users[]` array in memory
3. If found, compares password hash
4. Returns JWT token if valid

**Why it's temporary:**
- Data stored in memory (not disk)
- Lost on server restart
- Not shared across instances
- Not suitable for production

**What you need:**
- A real database (Postgres, MongoDB, etc.)
- Persistent storage
- Shared across all server instances

The authentication logic is correct - we just need persistent storage! 🚀
