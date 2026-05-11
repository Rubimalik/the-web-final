# Quick Start: Role-Based Access Control System

## 🚀 Setup (5 Minutes)

### Step 1: Apply Database Migration
```bash
# Push migration to Supabase
supabase db push

# Or if using remote Supabase:
supabase migration up --linked
```

### Step 2: Create Admin Role (Manual SQL)
Connect to your Supabase database and run:

```sql
-- Get your admin user ID from Supabase Auth
-- Then run this (replace UUID):

INSERT INTO public.user_roles (
  user_id, 
  role, 
  assigned_by, 
  assigned_at
)
VALUES (
  'YOUR-ADMIN-USER-UUID-HERE',
  'admin',
  'YOUR-ADMIN-USER-UUID-HERE',
  now()
);
```

**To find your user ID:**
1. Go to Supabase Dashboard
2. Select your project
3. Go to Authentication > Users
4. Copy the UUID of your admin user

### Step 3: Login and Test
1. Sign in to admin panel at `/admin/dashboard`
2. Navigate to `/admin/users`
3. You should see the new role management interface

## 📖 Basic Usage

### Grant Admin Role to User
```typescript
// Using API:
const response = await fetch('/api/admin/roles/grant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid-here',
    role: 'admin',
    notes: 'Promoted to admin' // optional
  })
});
```

### Grant Dealer Role to User
```typescript
const response = await fetch('/api/admin/roles/grant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid-here',
    role: 'dealer'
  })
});
```

### Revoke Role
```typescript
const response = await fetch('/api/admin/roles/revoke', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid-here',
    role: 'admin'
  })
});
```

### Get User Roles (Server-Side)
```typescript
import { getUserRoles } from '@/lib/auth/getUserRoles';

const roles = await getUserRoles(userId);
console.log(roles); // ['admin', 'dealer']
```

### Check Access (Server-Side)
```typescript
import { hasAdminRole, hasDealerRole } from '@/lib/auth/hasUserRole';

const isAdmin = await hasAdminRole(userId);
const isDealer = await hasDealerRole(userId);

if (isAdmin && isDealer) {
  console.log('User can access both admin and dealer areas');
}
```

## 🎯 Common Tasks

### Task 1: Make User an Admin
1. Go to Admin Dashboard
2. Click "Users" in sidebar
3. Search for user by name or email
4. Click "+ Admin" button
5. Done!

### Task 2: Give User Dealer Access
1. Go to Admin Dashboard > Users
2. Find the user
3. Click "+ Dealer" button
4. Dealer can now login to dealer panel

### Task 3: Revoke Admin Access
1. Go to Admin Dashboard > Users
2. Find the admin user
3. Click "- Admin" button
4. Admin access removed immediately

### Task 4: Give User Both Roles
1. Go to Admin Dashboard > Users
2. Find the user
3. Click "+ Admin"
4. Click "+ Dealer"
5. User now has both roles

## 📊 Admin Panel Features

### Users Page (`/admin/users`)
- **Search**: Find users by name or email
- **Filter by Role**: Show only admins, dealers, or customers
- **Grant Roles**: Add admin or dealer role with one click
- **Revoke Roles**: Remove role with one click
- **Real-time Updates**: Changes apply immediately
- **Role Badges**: See active roles at a glance

### Role Display
- Green badges show active roles
- Greyed out buttons show available actions
- Red buttons show revoke options

## 🔒 Security Notes

✅ **Server-Side Only** - Role checking happens on server
✅ **No Frontend Hacks** - UI cannot bypass role system
✅ **Audit Trail** - See who assigned each role and when
✅ **Database Protected** - RLS prevents unauthorized access
✅ **Secure Revocation** - Revoked roles take effect on next login

## 🧪 Testing Roles Locally

### Create Test Users in Supabase
1. Go to Supabase Auth dashboard
2. Add users:
   - test-admin@example.com
   - test-dealer@example.com
   - test-customer@example.com

### Assign Roles via SQL
```sql
-- Get UUIDs from auth.users table first

-- Make first user admin
INSERT INTO public.user_roles VALUES (
  gen_random_uuid(),
  'ADMIN-USER-UUID',
  'admin',
  NULL,
  now(),
  NULL,
  NULL,
  'Admin user',
  now(),
  now()
);

-- Make second user dealer
INSERT INTO public.user_roles VALUES (
  gen_random_uuid(),
  'DEALER-USER-UUID',
  'dealer',
  'ADMIN-USER-UUID',
  now(),
  NULL,
  NULL,
  NULL,
  now(),
  now()
);
```

### Test Access
```bash
# Login as admin@example.com
# Should access: /admin/dashboard ✓

# Login as dealer@example.com  
# Should access: /dealer ✓

# Login as customer@example.com
# Should NOT access: /admin ✗, /dealer ✗
# CAN access: /products, / ✓
```

## 📱 API Reference

### POST /api/admin/roles/grant
Assign a role to a user

**Request:**
```json
{
  "userId": "user-uuid",
  "role": "admin|dealer|customer",
  "notes": "Optional notes"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Role 'admin' assigned to user"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "User already has admin role"
}
```

### POST /api/admin/roles/revoke
Remove a role from a user

**Request:**
```json
{
  "userId": "user-uuid",
  "role": "admin|dealer|customer"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Role 'admin' revoked from user"
}
```

### GET /api/admin/users
List all users with their roles

**Query Parameters:**
- `limit` (1-100, default 50)
- `offset` (default 0)
- `role` (admin|dealer|customer - optional)
- `search` (name or email - optional)

**Response:**
```json
{
  "data": [
    {
      "user_id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "active_roles": ["admin", "dealer"],
      "active_role_count": 2,
      "created_at": "2026-05-08T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 150,
    "totalPages": 3
  }
}
```

## ⚠️ Troubleshooting

### Problem: Cannot Access Admin Panel
**Solution:**
1. Verify admin role assigned: 
   ```sql
   SELECT * FROM public.user_roles 
   WHERE user_id = 'your-uuid' AND revoked_at IS NULL;
   ```
2. Try logging out and back in
3. Check browser console for errors

### Problem: Users Not Showing in Admin Panel
**Solution:**
1. Verify migration applied:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'user_roles';
   ```
2. Check if users have any roles assigned
3. Verify Supabase auth users exist

### Problem: Role Grant Returns Error
**Solution:**
1. Verify user_id is valid UUID
2. Check you have admin role
3. Ensure role is 'admin', 'dealer', or 'customer'
4. Try refreshing page

## 📚 Documentation
- **Full Details**: See `docs/RBAC_IMPLEMENTATION.md`
- **Setup Checklist**: See `RBAC_CHECKLIST.md`
- **Architecture**: See `docs/RBAC_IMPLEMENTATION.md#architecture`

## 🎓 What to Know

### Default Access
- Everyone can browse public website (no role needed)
- Authenticated users can access their account

### Required Roles
- **Admin Access** - Must have 'admin' role
- **Dealer Access** - Must have 'dealer' role
- **Customer Access** - Automatic (no role needed)

### Multiple Roles
- User can have many roles simultaneously
- Each role grants independent access
- Revoking one role keeps others active

### No Auto-Promotion
- Users don't become admin/dealer automatically
- Admin must explicitly assign roles
- No privileges by default

---

**Ready to use!** Start by assigning roles to users in the Admin Panel.
