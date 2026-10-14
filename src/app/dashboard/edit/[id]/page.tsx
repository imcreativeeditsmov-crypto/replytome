"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PostService } from "@/lib/services/postService";
import { PostEditor } from "@/components/PostEditor";
import { Post } from "@/types";
import { Loader2 } from "lucide-react";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    PostService.getPostById(id).then((fetched) => {
      if (fetched) {
        setPost(fetched);
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#0071E3]" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return <PostEditor initialPost={post} isEditing={true} />;
}
