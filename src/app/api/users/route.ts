import { NextRequest, NextResponse } from "next/server";
import { ServerStorage } from "@/lib/server/storage";
import { UserProfile } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");
    const uid = req.nextUrl.searchParams.get("uid");
    const checkAvailability = req.nextUrl.searchParams.get("check") === "availability";

    // 1. Username availability check
    if (username && checkAvailability) {
      const isAvailable = ServerStorage.isUsernameAvailable(username, uid || undefined);
      return NextResponse.json({ success: true, available: isAvailable, username });
    }

    // 2. Fetch specific user profile
    if (username) {
      const user = ServerStorage.getUserByUsername(username);
      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, user });
    }

    if (uid) {
      const user = ServerStorage.getUser(uid);
      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, user });
    }


    // 3. Return all users (public overview)
    const users = ServerStorage.getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED" || error?.message?.includes("prerendering")) {
      throw error;
    }
    console.error("Users API GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user } = body;

    if (!user || !user.uid || !user.username) {
      return NextResponse.json(
        { success: false, error: "Invalid user data. UID and username are required." },
        { status: 400 }
      );
    }

    // Check availability if new username
    const isAvailable = ServerStorage.isUsernameAvailable(user.username, user.uid);
    if (!isAvailable) {
      return NextResponse.json(
        { success: false, error: "Username is already taken by another creator." },
        { status: 409 }
      );
    }

    const savedUser = ServerStorage.saveUser(user as UserProfile);

    return NextResponse.json({
      success: true,
      user: savedUser,
      message: "User profile saved successfully",
    });
  } catch (error) {
    console.error("Users API POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to save user profile" }, { status: 500 });
  }
}
