"use client";

import { useState, useRef, useEffect } from "react";
import { PostCard } from "@/app/_components/PostCard";
import { AddPostModal, type ModalState } from "@/app/_components/AddPostModal";
import { api } from "@/trpc/react";
import { Plus, Share } from "lucide-react";

export default function FeedPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = api.post.getFeed.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const [modalInitialState, setModalInitialState] = useState<ModalState | null>(
    null,
  );

  // Intersection Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const openModal = (state: ModalState) => {
    setModalInitialState(state);
  };

  const closeModal = () => {
    setModalInitialState(null);
  };

  return (
    <div className="space-y-2 pb-16">
      {data?.pages.map((page) =>
        page.items.map((post) => (
          <PostCard key={post.id} post={post} session={post.saunaSession} />
        )),
      )}

      {/* Loading & Observer Element */}
      <div ref={observerTarget} className="flex justify-center py-4">
        {(isLoading || isFetchingNextPage) && (
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white" />
        )}
      </div>

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
