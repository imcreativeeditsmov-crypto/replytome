import { NextRequest, NextResponse } from "next/server";
import { ServerStorage } from "@/lib/server/storage";

export async function GET(req: NextRequest) {
  try {
    const requesterUid = req.nextUrl.searchParams.get("requesterUid") || req.nextUrl.searchParams.get("uid");
    const requesterUsername = req.nextUrl.searchParams.get("requesterUsername") || req.nextUrl.searchParams.get("username");

    // Check if requester is authorized admin
    let isAdmin = false;

    if (requesterUsername && requesterUsername.toLowerCase() === "aibyshivai") {
      isAdmin = true;
    } else if (requesterUid) {
      const user = ServerStorage.getUser(requesterUid);
      if (
        user &&
        (user.isAdmin ||
          user.role === "admin" ||
          user.username.toLowerCase() === "aibyshivai" ||
          user.uid === "shivai-creator-uid" ||
          user.email?.toLowerCase().includes("aibyshivai"))
      ) {
        isAdmin = true;
      }
    }

    // Also allow in local development or if admin query is passed
    if (process.env.NODE_ENV === "development" && (!requesterUid || requesterUid === "shivai-creator-uid")) {
      isAdmin = true;
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
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
