"use client";

import { useState } from "react";
import { PostCard } from "@/app/_components/PostCard";
import { AddPostModal, type ModalState } from "@/app/_components/AddPostModal";
import { api } from "@/trpc/react";
import { Plus, Share } from "lucide-react";

export default function FeedPage() {
  const { data: posts } = api.post.getFeed.useQuery();
  const [modalInitialState, setModalInitialState] = useState<ModalState | null>(
    null,
  );

  const openModal = (state: ModalState) => {
    setModalInitialState(state);
  };

  const closeModal = () => {
    setModalInitialState(null);
  };

  return (
    <div className="space-y-2 pb-16">
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} session={post.saunaSession} />
      ))}
      <div className="fixed right-4 bottom-24 flex flex-col gap-3">
        <button
          onClick={() => openModal("selectSession")}
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
          title="Create post from session"
        >
          <Share className="h-6 w-6" />
        </button>
        <button
          onClick={() => openModal("createSession")}
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
          title="Log manual session"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {modalInitialState && (
        <AddPostModal onClose={closeModal} initialState={modalInitialState} />
      )}
    </div>
  );
}
