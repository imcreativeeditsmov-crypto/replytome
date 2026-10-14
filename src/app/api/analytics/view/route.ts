import { NextRequest, NextResponse } from "next/server";
import { MockStore } from "@/lib/firebase/mockData";

export async function POST(req: NextRequest) {
  try {
    let postId = "";
    try {
      const body = await req.json();
      postId = body?.postId || "";
    } catch {
      // ignore
    }

    if (postId) {
      MockStore.incrementViews(postId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Record view error:", err);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
