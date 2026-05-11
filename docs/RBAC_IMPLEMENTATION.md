# Role-Based Access Control (RBAC) System Implementation

## Overview
Implemented a comprehensive role-based access control system for BuySupply that allows admins to manually assign and manage user roles. Users no longer automatically become admin or dealer upon login - all access is now controlled via explicit role assignments in the admin panel.

## Architecture

### Access Types (Roles)
1. **Customer** - Default access to the public website
2. **Dealer** - Access to dealer storefront and wholesale pricing
3. **Admin** - Access to admin dashboard and user management
4. **Multiple Roles** - A user can have any combination of the above roles

### Role Assignment Flow
```
Supabase User (email/password) 
  ↓
Admin Dashboard
  ↓
Grant/Revoke Roles via API
  ↓
Stored in user_roles Table
  ↓
Authorization Check During Login
  ↓
Access Granted to Appropriate Areas
```

## Database Schema Changes

### New Table: `public.user_roles`
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY (auto-generated)
  user_id UUID NOT NULL (references auth.users)
  role TEXT NOT NULL (enum: 'customer', 'dealer', 'admin')
  assigned_by UUID (who assigned the role, null if auto-assigned)
  assigned_at TIMESTAMPTZ (when role was assigned)
  revoked_at TIMESTAMPTZ (null if role is active)
  revoked_by UUID (who revoked the role)
  notes TEXT (optional notes about the assignment)
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
  
  UNIQUE(user_id, role) -- One active assignment per role per user
  CHECK (role IN ('customer', 'dealer', 'admin'))
  CHECK (revoked_at IS NULL OR revoked_by IS NOT NULL)
);
```

### New View: `public.user_roles_summary`
Provides efficient summary view for admin dashboard showing:
- user_id, full_name, email
- active_roles (array of currently assigned roles)
- revoked_roles (array of previously revoked roles)
- last_role_assignment (timestamp of most recent active role)
- active_role_count (count of active roles)
- created_at, updated_at

### Indexes
- `user_roles_user_id_idx` - Fast lookups by user
- `user_roles_role_idx` - Fast filtering by role
- `user_roles_active_idx` - Fast active role queries
- `user_roles_assigned_by_idx` - Audit trail
- `user_roles_assigned_at_idx` - Timeline queries

### Database Functions
1. `get_user_active_roles(user_id)` - Get all active roles for a user
2. `has_user_role(user_id, required_role)` - Check if user has specific role

## Files Created

### 1. Database Migration
**File:** `supabase/migrations/20260508_rbac_user_roles.sql`
- Creates `user_roles` table with all constraints and indexes
- Creates helper functions for role checking
- Sets up Row-Level Security (RLS) policies
- Creates `user_roles_summary` view for admin dashboard

### 2. Auth Utilities

**File:** `lib/auth/getUserRoles.ts`
- `getUserRoles(userId)` - Get array of active roles
- `getUserRolesDetailed(userId)` - Get role with metadata
- `userHasAnyRole(userId, roles[])` - Check if user has at least one role
- `userHasAllRoles(userId, roles[])` - Check if user has all specified roles
- `assignRoleToUser(userId, role, assignedBy, notes)` - Assign role (server-side only)
- `revokeRoleFromUser(userId, role, revokedBy)` - Revoke role (server-side only)

**File:** `lib/auth/hasUserRole.ts`
- `hasAdminRole(userId)` - Check admin access
- `hasDealerRole(userId)` - Check dealer access
- `hasCustomerAccess(userId)` - Check customer access (always true)
- `canAccessRole(userId, role)` - Generic role check
- `getUserAccessSummary(userId)` - Get all access levels for a user

### 3. Admin APIs

**File:** `app/api/admin/roles/grant/route.ts`
```
POST /api/admin/roles/grant
Requires: admin role
Body: { userId, role, notes? }
Response: { success, message/error }
```
- Assigns a role to a user
- Validates admin access server-side
- Handles revoked role reactivation

**File:** `app/api/admin/roles/revoke/route.ts`
```
POST /api/admin/roles/revoke
Requires: admin role
Body: { userId, role }
Response: { success, message/error }
```
- Revokes a role from a user
- Validates role exists and is active

**File:** `app/api/admin/users/route.ts` (Updated)
```
GET /api/admin/users?limit=50&offset=0&role=admin&search=john
Returns: { data: users[], pagination: {...} }
```
- Lists all users with their roles
- Supports filtering by role and searching by name/email
- Uses efficient `user_roles_summary` view

### 4. UI Components

**File:** `app/admin/users/page.tsx` (Updated)
- Enhanced user management page with role management UI
- Display active roles as badges
- Grant/revoke buttons for each role
- Real-time updates after role changes
- Search and filter functionality
- Success/error messages

## Modified Files

### `lib/admin-auth.ts`
**Changes:**
- Updated `isApprovedAdmin()` to check the new `user_roles` table
- Updated `getApprovedAdmin()` to verify admin role via `hasAdminRole()`
- No longer checks `auth.role === "admin"` from profiles table

### `lib/dealer-session.ts`
**Changes:**
- Updated `getApprovedDealerAuth()` to check the new `user_roles` table
- Updated `hasDealerAccess()` to verify dealer role via `hasDealerRole()`
- Maintains backward compatibility with dealer code-based access
- Supports both methods:
  1. Dealer code login (temporary session)
  2. Supabase login with dealer role

## How Roles Work

### Role Assignment
1. Admin logs in to admin panel
2. Navigate to `Admin > Users`
3. Search or filter for the user
4. Click "Grant Admin" or "Grant Dealer" button
5. System adds entry to `user_roles` table with:
   - `assigned_by` = current admin's user_id
   - `assigned_at` = current timestamp
   - `revoked_at` = NULL (active)

### Role Checking
1. User logs in via Supabase (email/password)
2. Authentication creates session with access tokens
3. During protected route access, system calls `getAuthenticatedProfile()`
4. Auth function checks `user_roles` table for active roles
5. If user has required role, access is granted
6. If no role found, request is rejected with 403 Forbidden

### Role Revocation
1. Admin clicks "Revoke Admin" or "Revoke Dealer"
2. System updates the role entry:
   - Sets `revoked_at` = current timestamp
   - Sets `revoked_by` = current admin's user_id
3. User immediately loses access to that area
4. Existing sessions continue until timeout

### Multiple Roles
Users can have multiple roles:
- `user1@example.com` → [admin]
- `user2@example.com` → [dealer]
- `user3@example.com` → [admin, dealer]
- `user4@example.com` → [] (customer only)

Each role is independent and can be granted/revoked separately.

## Access Control Matrix

| Access Path | Required | Check | Fallback |
|---|---|---|---|
| `/admin/*` | Admin role | `hasAdminRole()` | Redirect to /login |
| `/dealer/*` | Dealer role OR dealer code | `hasDealerRole()` OR dealer session | Redirect to /dealer/login |
| `/products` | None | Always allowed | Public access |
| `/account` | Authenticated | Supabase session | Redirect to /signin |

## Security Considerations

### Server-Side Validation ✓
- All role checks happen on the server
- Role assignment APIs require admin role (server-side verified)
- User cannot modify their own roles
- Roles stored in database, not in tokens

### Protection Against Privilege Escalation ✓
- No auto-promotion to admin/dealer
- Admin-only endpoints validate via `getApprovedAdmin()`
- Dealer endpoints validate via `hasDealerRole()`
- RLS policies prevent unauthorized access to `user_roles` table

### Audit Trail ✓
- `assigned_by` field tracks who assigned each role
- `revoked_by` field tracks who revoked each role
- `assigned_at` and `revoked_at` timestamps
- Optional `notes` field for documenting reasons

### Protected Fields ✓
- Supabase RLS prevents users from modifying their own roles
- `enforce_profile_sensitive_field_updates()` trigger prevents role changes via client

## Testing Guide

### Local Setup
1. Run Supabase migrations:
   ```bash
   npx supabase migration up
   ```

2. Create test users in Supabase Auth:
   - admin@example.com (password: Admin123!)
   - dealer@example.com (password: Dealer123!)
   - customer@example.com (password: Customer123!)

### Test Scenario 1: Admin Cannot Login Without Admin Role
```
1. Sign in with admin@example.com (no role assigned yet)
2. Try to access /admin/dashboard
3. Should redirect to /login or show 403 error
```

### Test Scenario 2: Grant Admin Role
```
1. Admin account must first have admin role
2. In database: INSERT INTO user_roles 
   VALUES (uuid, admin_id, 'admin', admin_id, now(), NULL, NULL, NULL)
3. Admin now can access /admin/dashboard
```

### Test Scenario 3: Grant Dealer Role
```
1. From admin dashboard, go to Users > Dealers
2. Find dealer@example.com
3. Click "Grant Dealer"
4. Dealer can now login and access /dealer
```

### Test Scenario 4: Multiple Roles
```
1. From admin dashboard, select a user
2. Click "Grant Admin"
3. Click "Grant Dealer"
4. User can access both /admin and /dealer paths
```

### Test Scenario 5: Revoke Role
```
1. User has both admin and dealer roles
2. Click "Revoke Admin"
3. Admin role is removed
4. User can still access /dealer but not /admin
```

### Test Scenario 6: Customer Access (No Roles)
```
1. Create user with no roles
2. User can still access public website (/products, /)
3. Cannot access /admin or /dealer
4. Can create account and browse as customer
```

### Test Scenario 7: Existing Users
```
1. Users with existing Supabase login continue to work
2. They get "Customer" access by default
3. Admin must explicitly grant admin/dealer roles
4. No automatic promotion happens
```

## Backward Compatibility

### Old Code
- `auth.role === "admin"` checks will no longer work reliably
- Old single-role system is replaced

### Migration Path
- Old `profiles.role` field remains but is not used for authorization
- All new role checks go to `user_roles` table
- Existing admin users must have role explicitly assigned
- No automatic migration of old roles

### Existing Features Protected
- Customer website still works normally
- Dealer panel logic updated but maintains same behavior
- Admin panel logic updated but maintains same behavior

## Audit & Monitoring

### Tracking Role Changes
Query to see who changed roles and when:
```sql
SELECT 
  ur.user_id,
  ur.role,
  ur.assigned_by,
  ur.assigned_at,
  ur.revoked_by,
  ur.revoked_at,
  ur.notes
FROM public.user_roles ur
ORDER BY ur.assigned_at DESC
LIMIT 100;
```

### Active Users by Role
```sql
SELECT 
  role,
  COUNT(*) as user_count
FROM (
  SELECT DISTINCT user_id, role 
  FROM public.user_roles 
  WHERE revoked_at IS NULL
) active_roles
GROUP BY role;
```

## Troubleshooting

### User Cannot Access Admin Panel
1. Verify user has admin role:
   ```sql
   SELECT * FROM public.user_roles 
   WHERE user_id = 'user_id' AND role = 'admin' AND revoked_at IS NULL;
   ```
2. Check if revoked:
   ```sql
   SELECT * FROM public.user_roles 
   WHERE user_id = 'user_id' AND revoked_at IS NOT NULL;
   ```
3. Verify `getApprovedAdmin()` is being called

### Role Grant Returns Error
- Check user_id format (must be valid UUID)
- Verify admin making the change has admin role
- Check if role already assigned (should be rejected)
- Check database connection

### Users Not Showing in Admin Panel
- Verify `user_roles_summary` view exists:
  ```sql
  SELECT * FROM public.user_roles_summary LIMIT 1;
  ```
- Check if roles are actually assigned
- Verify RLS policies allow admin to see users

## Future Enhancements

1. **Role Expiration** - Auto-revoke roles after X days
2. **Role Approval Flow** - Requests pending admin approval
3. **Granular Permissions** - Per-section access control
4. **Activity Logging** - Track all role assignments
5. **Bulk Operations** - Grant roles to multiple users
6. **Role Templates** - Pre-defined role combinations
7. **IP Whitelisting** - Admin access from specific IPs

