import { NextRequest, NextResponse } from "next/server";
import { getApprovedAdmin, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = await getApprovedAdmin();
  if (!auth) return unauthorizedAdminResponse();

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "50", 10));
    const offset = Math.max(0, Number.parseInt(searchParams.get("offset") || "0", 10));
    const roleFilter = searchParams.get("role") || undefined;
    const search = searchParams.get("search") || undefined;

    const supabase = createSupabaseServiceRoleClient();

    // Use the user_roles_summary view for efficient querying
    let query = supabase
      .from("user_roles_summary")
      .select("*", { count: "exact" });

    // Apply filters
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%`,
      );
    }

    if (roleFilter) {
      // Filter by role in the active_roles array
      query = query.contains("active_roles", [roleFilter]);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[GET /api/admin/users]", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
