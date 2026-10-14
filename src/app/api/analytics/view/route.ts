import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { MockStore } from "@/lib/firebase/mockData";

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json();

    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ success: false, error: "Missing postId" }, { status: 400 });
    }

    if (isAdminConfigured && adminDb) {
      const postRef = adminDb.collection("posts").doc(postId);
      const docSnap = await postRef.get();
      if (docSnap.exists) {
        const curViews = docSnap.data()?.views || 0;
        await postRef.update({ views: curViews + 1 });
      }
    } else {
      MockStore.incrementViews(postId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Record view error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
