import { NextRequest, NextResponse } from "next/server";
import { unlockService } from "@/lib/services/unlockService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, commenterHandle, isRestore } = body;

    if (!postId || typeof postId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid or missing postId" },
        { status: 400 }
      );
    }

    if (!isRestore && (!commenterHandle || typeof commenterHandle !== "string" || commenterHandle.trim().length < 2)) {
      return NextResponse.json(
        { success: false, error: "Kripya apna Instagram username (@handle) enter karein" },
        { status: 400 }
      );
    }

    const result = await unlockService.unlockPost(postId, commenterHandle);

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
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
