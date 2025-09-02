import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import duesToCache from "@/app/lib/cache";

// GET /api/cache/stats - Get cache statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const stats = duesToCache.getStats();

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        message: `Cache contains ${stats.size} entries`,
      },
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/cache/clear - Clear cache (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get("pattern");

    if (pattern) {
      // Clear cache entries matching pattern
      const deletedCount = duesToCache.invalidateByPattern(pattern);
      return NextResponse.json({
        success: true,
        message: `Cleared ${deletedCount} cache entries matching pattern: ${pattern}`,
      });
    } else {
      // Clear all cache
      duesToCache.clear();
      return NextResponse.json({
        success: true,
        message: "Cache cleared successfully",
      });
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
