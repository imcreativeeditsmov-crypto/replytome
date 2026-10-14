import { NextRequest, NextResponse } from "next/server";
import { ServerStorage } from "@/lib/server/storage";
import { Post, UserProfile } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const slug = searchParams.get("slug");
    const uid = searchParams.get("uid");

    if (username && slug) {
      const data = ServerStorage.getPostBySlug(username, slug);
      if (!data) {
        return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, post: data.post, user: data.user });
    }

    if (username) {
      const posts = ServerStorage.getPublishedPostsByUsername(username);
      const user = ServerStorage.getUser(username);
      return NextResponse.json({ success: true, posts, user });
    }

    const posts = ServerStorage.getPosts(uid || undefined);
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("API /api/posts GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Bulk sync from client localStorage
    if (body.posts && Array.isArray(body.posts)) {
      ServerStorage.bulkSyncPosts(body.posts as Post[], body.uid);
      return NextResponse.json({
        success: true,
        message: "Posts synced successfully",
        count: body.posts.length,
      });
    }

    // 2. Reorder action
    if (body.action === "reorder" && Array.isArray(body.postIds)) {
      ServerStorage.reorderPosts(body.postIds);
      return NextResponse.json({ success: true, message: "Posts reordered" });
    }

    // 3. User update
    if (body.user) {
      const updatedUser = ServerStorage.saveUser(body.user as UserProfile);
      return NextResponse.json({ success: true, user: updatedUser });
    }

    // 4. Single post save
    if (body.post) {
      const savedPost = ServerStorage.savePost(body.post);
      return NextResponse.json({ success: true, post: savedPost });
    }

    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
  } catch (error) {
    console.error("API /api/posts POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to save post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing post id" }, { status: 400 });
    }

    const deleted = ServerStorage.deletePost(id);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("API /api/posts DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 500 });
  }
}
