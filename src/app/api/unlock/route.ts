import { NextRequest, NextResponse } from "next/server";
import { unlockService } from "@/lib/services/unlockService";
import { INITIAL_DEMO_POSTS } from "@/lib/firebase/mockData";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { postId, commenterHandle, isRestore } = body;

    const safePostId = postId || INITIAL_DEMO_POSTS[0].id;

    if (!isRestore && commenterHandle !== undefined) {
      const clean = String(commenterHandle).trim().replace(/^@/, "");
      if (!clean || clean.length < 2) {
        return NextResponse.json(
          { success: false, error: "Please enter your Instagram username (@handle)" },
          { status: 400 }
        );
      }
    }

    const result = await unlockService.unlockPost(safePostId, commenterHandle);

    if (!result.verified) {
      return NextResponse.json(
        { success: false, error: result.error || "Comment verification failed" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      textBlocks: result.textBlocks,
      images: result.images,
    });
  } catch (error) {
    console.error("Unlock API error:", error);
    const fallbackPost = INITIAL_DEMO_POSTS[0];
    return NextResponse.json({
      success: true,
      textBlocks: fallbackPost?.textBlocks || [],
      images: fallbackPost?.images || [],
    });
  }
}
