"use client";

import { useState } from "react";
import { PostCard } from "@/app/_components/PostCard";
import { AddPostModal } from "@/app/_components/AddPostModal";
import { api } from "@/trpc/react";
import { Plus } from "lucide-react";
import { UnsharedSessionCard } from "../_components/UnsharedSessionCard";

export default function FeedPage() {
  const { data: posts } = api.post.getFeed.useQuery();
  const { data: latestSession } = api.user.getLatestSession.useQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-2 pb-16">
      {latestSession && !latestSession.postedByCurrentUser && (
        <UnsharedSessionCard session={latestSession} />
      )}
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <button
        onClick={() => openModal()}
        className="fixed right-4 bottom-24 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
      >
        <Plus className="h-8 w-8" />
      </button>
      {isModalOpen && <AddPostModal onClose={closeModal} />}
    </div>
  );
}
