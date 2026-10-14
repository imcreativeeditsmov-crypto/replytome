import { NextRequest, NextResponse } from "next/server";
import { ServerStorage } from "@/lib/server/storage";
import { isPlatformAdmin } from "@/lib/auth/adminCheck";

export async function GET(req: NextRequest) {
  try {
    const requesterUid = req.nextUrl.searchParams.get("requesterUid") || req.nextUrl.searchParams.get("uid");
    const requesterUsername = req.nextUrl.searchParams.get("requesterUsername") || req.nextUrl.searchParams.get("username");

    // Strictly authenticate requester as platform admin
    let isAdmin = false;

    if (requesterUsername && isPlatformAdmin({ username: requesterUsername })) {
      isAdmin = true;
    } else if (requesterUid) {
      if (isPlatformAdmin({ uid: requesterUid })) {
        isAdmin = true;
      } else {
        const user = ServerStorage.getUser(requesterUid);
        if (user && isPlatformAdmin(user)) {
          isAdmin = true;
        }
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Super Admin privileges required." },
        { status: 403 }
      );
    }

    const stats = ServerStorage.getAdminStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED" || error?.message?.includes("prerendering")) {
      throw error;
    }
    console.error("Admin stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
