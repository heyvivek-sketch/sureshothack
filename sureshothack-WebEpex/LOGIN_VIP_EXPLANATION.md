# Login & VIP Status Implementation Guide

## 🔐 How Login Works

### Step-by-Step Login Process

1. **User submits login form** → Frontend sends POST to `/api/auth/signin`
2. **Backend receives credentials** → `{ email: "user@example.com", password: "password123" }`
3. **Email normalization** → Converts to lowercase and trims whitespace
4. **Search users array** → Looks for user with matching email:
   ```typescript
   const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
   ```
5. **User found?** → If not found, returns "Invalid email or password"
6. **Password verification** → Compares plain password with stored hash:
   ```typescript
   const isPasswordValid = await verifyUserPassword(user, body.password);
   // Uses bcrypt.compare(password, user.password)
   ```
7. **Password valid?** → If not valid, returns "Invalid email or password"
8. **Generate JWT token** → Creates token with `userId` and `email`
9. **Return success** → Returns token + user data (including VIP/Premium status)

### How User Credentials Are Saved

#### During Signup (`/api/auth/signup`):

```typescript
// 1. User submits: { email, fullName, password }
const body = await request.json();

// 2. Validate input (email format, password length, etc.)
const validation = validateSignupInput(body);

// 3. Check if email already exists
const existingUser = users.find((u) => 
  u.email.toLowerCase() === input.email.toLowerCase()
);

// 4. Hash password (NEVER store plain text!)
const hashedPassword = await hashPassword(input.password);
// Uses bcrypt.hash(password, 10) → "$2a$10$..."

// 5. Create user object
const newUser: User = {
  id: uuidv4(),                    // Unique ID
  email: input.email.toLowerCase(), // Normalized email
  fullName: input.fullName.trim(),
  password: hashedPassword,        // Hashed, never plain text!
  isPremium: false,                // Default: false
  isVip: false,                    // Default: false
  createdAt: new Date(),
};

// 6. Save to in-memory array
users.push(newUser);
```

**Important:** Passwords are **NEVER** stored in plain text. They're hashed using bcrypt with 10 salt rounds.

### How Login Verification Works

```typescript
// In app/api/auth/signin/route.ts

// 1. Find user by email (case-insensitive)
const user = await findUserByEmail(body.email);
// Searches: users.find(u => u.email.toLowerCase() === email.toLowerCase())

// 2. If user not found
if (!user) {
  return { success: false, message: 'Invalid email or password' };
}

// 3. Verify password
const isPasswordValid = await verifyUserPassword(user, body.password);
// Internally: bcrypt.compare(plainPassword, hashedPassword)

// 4. If password invalid
if (!isPasswordValid) {
  return { success: false, message: 'Invalid email or password' };
}

// 5. Generate JWT token
const token = generateToken({ userId: user.id, email: user.email });

// 6. Return success with user data
return {
  success: true,
  token,
  user: {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isPremium: user.isPremium ?? false,
    isVip: user.isVip ?? false,
  }
};
```

## 👑 VIP Status Management

### How VIP Status is Stored

VIP status is stored as part of the user object in the `users` array:

```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
  password: string;        // Hashed
  isPremium?: boolean;     // Premium membership status
  isVip?: boolean;         // VIP status
  createdAt: Date;
}
```

### Default Values

- **New users**: `isPremium: false`, `isVip: false`
- **Existing users**: Preserved from previous updates

### Updating VIP Status

#### Method 1: Update VIP Only

```typescript
// PUT /api/user/vip
// Body: { isVip: true }

const updatedUser = await updateUserVipStatus(userId, true);
```

#### Method 2: Update Both VIP and Premium

```typescript
// PUT /api/user/vip
// Body: { isVip: true, isPremium: true }

const updatedUser = await updateUserStatus(userId, {
  isVip: true,
  isPremium: true
});
```

### API Endpoint: `/api/user/vip`

**Method:** `PUT`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isVip": true,
  "isPremium": false  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "isPremium": false,
    "isVip": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Checking VIP Status

VIP status is included in:
- ✅ Login response (`/api/auth/signin`)
- ✅ Signup response (`/api/auth/signup`)
- ✅ Current user endpoint (`/api/user/me`)

## 🔍 Debugging: View All Users

**Development Only!** Use this endpoint to see all users in the array:

```
GET /api/debug/users
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "id": "uuid-1",
      "email": "user1@example.com",
      "fullName": "User One",
      "isPremium": false,
      "isVip": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "email": "user2@example.com",
      "fullName": "User Two",
      "isPremium": true,
      "isVip": true,
      "createdAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "note": "This is a debug endpoint. Remove in production!"
}
```

**⚠️ WARNING:** This endpoint is disabled in production for security.

## 📊 Data Flow Diagram

```
Signup Flow:
┌─────────────┐
│ User Signs  │
│   Up        │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Validate Input  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Check Email     │
│ Exists?         │
└──────┬──────────┘
       │ (No)
       ▼
┌─────────────────┐
│ Hash Password   │
│ (bcrypt)        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Create User     │
│ isVip: false    │
│ isPremium: false│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Save to Array   │
│ users.push()    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Return Token +  │
│ User Data       │
└─────────────────┘

Login Flow:
┌─────────────┐
│ User Logs   │
│   In        │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Normalize Email │
│ (lowercase)     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Search Array    │
│ users.find()    │
└──────┬──────────┘
       │
       ▼ (Found?)
┌─────────────────┐
│ Compare Hash    │
│ bcrypt.compare()│
└──────┬──────────┘
       │
       ▼ (Valid?)
┌─────────────────┐
│ Generate JWT   │
│ Token          │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Return Token +  │
│ User (with VIP) │
└─────────────────┘
```

## 🛠️ User Service Functions

### Core Functions

```typescript
// Create user (defaults: isVip=false, isPremium=false)
createUser(input: CreateUserInput): Promise<User>

// Find user by email (case-insensitive)
findUserByEmail(email: string): Promise<User | null>

// Find user by ID
findUserById(id: string): Promise<User | null>

// Verify password
verifyUserPassword(user: User, password: string): Promise<boolean>
```

### VIP/Premium Functions

```typescript
// Update VIP status only
updateUserVipStatus(userId: string, isVip: boolean): Promise<User>

// Update Premium status only
updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<User>

// Update both VIP and Premium
updateUserStatus(userId: string, updates: {
  isVip?: boolean;
  isPremium?: boolean;
}): Promise<User>
```

### Debug Functions (Development Only)

```typescript
// Get all users (without passwords)
getAllUsers(): User[]

// Get user count
getUserCount(): number
```

## ⚠️ Important Notes

### Current Limitations (In-Memory Storage)

1. **Data Loss on Restart**: Users array resets when server restarts
2. **Serverless Cold Starts**: Array may be empty on Vercel serverless functions
3. **Not Shared**: Multiple instances don't share the same array
4. **Not Production Ready**: Need database for production

### Security Best Practices

✅ **Implemented:**
- Passwords hashed with bcrypt (10 rounds)
- Email normalization (case-insensitive)
- JWT tokens for authentication
- Password never returned in responses

⚠️ **For Production:**
- Add rate limiting
- Use httpOnly cookies instead of localStorage
- Implement database (Postgres, MongoDB, etc.)
- Add password reset functionality
- Add email verification

## 🚀 Example Usage

### Frontend: Update VIP Status

```typescript
import { apiClient } from '@/lib/api';

// Make user VIP
const response = await apiClient.updateVipStatus({ isVip: true });

if (response.success) {
  console.log('User is now VIP:', response.user);
}
```

### Backend: Check VIP Status

```typescript
import { findUserById } from '@/lib/services/userService';

const user = await findUserById(userId);

if (user?.isVip) {
  // Grant VIP access
  console.log('VIP user detected!');
}
```

## 📝 Summary

**How login checks work:**
1. Email normalized and searched in `users[]` array
2. Password compared using bcrypt
3. JWT token generated on success

**How credentials are saved:**
1. Password hashed with bcrypt (never plain text)
2. User object stored in `users[]` array
3. VIP/Premium status defaults to `false`

**How VIP status works:**
1. Stored as `isVip` boolean in user object
2. Defaults to `false` on signup
3. Updated via `/api/user/vip` endpoint
4. Included in all user responses

**Current Storage:**
- In-memory array (`const users: User[] = []`)
- Resets on server restart
- Not suitable for production
- Need database for persistence

