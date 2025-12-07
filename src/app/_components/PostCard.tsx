"use client";

import { Card } from "./ui/card";
import {
  MapPin,
  MessageSquare,
  Bookmark,
  Share2,
  Calendar,
  Text,
  Send,
} from "lucide-react";
import { SessionChart } from "./SessionChart";
import { LoylyLikeButton } from "./LoylyLikeButton";
import { api, type RouterOutputs } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { formatDuration, timeAgo, generateSessionTitle } from "./ui/utils";
import { AddPostModal } from "./AddPostModal";

// Define types based on the new optimized output
type FeedPost = RouterOutputs["post"]["getFeed"]["items"][number];
// Allow for fallback to the full post type from other queries if needed
// The 'any' is a practical compromise to avoid complex union types for different query outputs
interface PostCardProps {
  post?: FeedPost | any;
  session: FeedPost["saunaSession"] | any;
}

export function PostCard({ post, session: saunaSession }: PostCardProps) {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showAddPostModal, setShowAddPostModal] = useState(false);

  // Fetch comments only when expanded and if we don't already have them in the post object
  // (The 'You' page query might still include comments directly)
  const hasEmbeddedComments = post?.comments && Array.isArray(post.comments);
  const { data: fetchedComments } = api.post.getComments.useQuery(
    { postId: post?.id ?? 0 },
    { enabled: !!post?.id && showComments && !hasEmbeddedComments },
  );

  const displayComments = hasEmbeddedComments ? post.comments : fetchedComments;

  // If we don't have a session, we can't mutate anyway
  const canMutate = !!session?.user;

  const commentMutation = api.post.createComment.useMutation({
    onSuccess: () => {
      // Invalidate both feed and specific comments
      utils.post.getFeed.invalidate();
      if (post?.id) {
        utils.post.getComments.invalidate({ postId: post.id });
        utils.post.getById.invalidate({ id: post.id });
      }
      utils.sauna.getMySessionsAndPosts.invalidate();
      setComment("");
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !canMutate) return;
    commentMutation.mutate({ postId: post.id, content: comment });
  };

  const likeMutation = api.post.likePost.useMutation({
    onMutate: async ({ postId }) => {
      await utils.post.getAll.cancel();
      await utils.post.getFeed.cancel();
      await utils.post.getLatest.cancel();

      // Optimistic updates could be more complex with pagination
      // For now we rely on invalidation, but we could update infinite data cache
    },
    onSettled: () => {
      utils.post.getAll.invalidate();
      utils.post.getFeed.invalidate();
      utils.sauna.getMySessionsAndPosts.invalidate();
      utils.post.getLatest.invalidate();
      if (post?.id) utils.post.getById.invalidate({ id: post.id });
    },
  });

  const unlikeMutation = api.post.unlikePost.useMutation({
    onMutate: async ({ postId }) => {
      await utils.post.getAll.cancel();
      await utils.post.getFeed.cancel();
      await utils.post.getLatest.cancel();

      // Simplified for now
    },
    onSettled: () => {
      utils.sauna.getMySessionsAndPosts.invalidate();
      utils.post.getAll.invalidate();
      utils.post.getFeed.invalidate();
      utils.post.getLatest.invalidate();
      if (post?.id) utils.post.getById.invalidate({ id: post.id });
    },
  });

  const isLiked = post?.likes.some((like: any) => like.userId === session?.user?.id);
  // Handle both optimized count object and direct array length
  const likeCount = post?._count?.likes ?? post?.likes?.length ?? 0;
  const commentCount = post?._count?.comments ?? post?.comments?.length ?? 0;

  const handleLike = () => {
    if (!post || !canMutate) return;
    if (isLiked) {
      unlikeMutation.mutate({ postId: post.id });
    } else {
      likeMutation.mutate({ postId: post.id });
    }
  };

  const saunaDuration = saunaSession?.durationMs
    ? formatDuration(saunaSession.durationMs)
    : "N/A";

  return (
    <Card className="heat-wave overflow-hidden rounded-2xl border-[#2C2B36] bg-[#1F1F23]">
      {/* User Info & Title */}
      <div className="pt-5 pr-3 pb-0 pl-5">
        <div className="mb-0 flex items-start gap-3">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white font-bold text-black"
            style={{ fontSize: "17px" }}
          >
            {post?.createdBy.name?.charAt(0) ?? session?.user?.name?.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-row justify-between">
              <p
                className="mb-0.5 font-normal text-gray-300"
                style={{ fontSize: "13px" }}
              >
                {post?.createdBy.name ?? session?.user.name}
              </p>
              {!saunaSession.manual && (
                <div className="flex items-center gap-1.5 rounded-full bg-gray-800 px-3 py-0.5">
                  <span className="text-xs font-medium text-gray-300">
                    Tracked with
                  </span>
                  <img
                    src="/harvia-logo.png"
                    alt="Harvia Logo"
                    className="h-3 w-auto object-contain"
                  />
                </div>
              )}
            </div>

            <h3
              className="mb-0 leading-tight font-bold text-white"
              style={{ fontSize: "22px" }}
            >
              {post?.name ??
                generateSessionTitle(
                  saunaSession.startTimestamp,
                  saunaSession.id,
                  saunaSession.avgTemperature,
                )}
            </h3>
          </div>
        </div>
      </div>
      {post?.achievement && (
        <div className="bg-gray-300/20 px-5 py-1 text-center text-white">
          <p className="font-semibold">
            🏆 {post.createdBy.name}{" "}
            {post.achievement.name === "First Sauna Session"
              ? "posted their first sauna session!"
              : post.achievement.name === "Hottest Sauna"
                ? `reached a new personal best of ${saunaSession?.maxTemperature?.toFixed(
                    0,
                  )}°C!`
                : post.achievement.name === "Longest Sauna"
                  ? `set a new duration record of ${saunaDuration}!`
                  : post.achievement.description}
          </p>
        </div>
      )}

      {/* Location & Description */}
      {saunaSession && (
        <div className="mt-0 pt-0 pr-3 pb-0 pl-5">
          <div className="mb-0.5 flex items-center gap-1 text-gray-400">
            <MapPin className="h-3 w-3" />
            <span className="font-normal" style={{ fontSize: "11px" }}>
              {saunaSession.sauna.name}
            </span>
          </div>
          <div className="mb-0.5 flex items-center gap-1 text-gray-400">
            <Calendar className="h-3 w-3" />
            <span className="font-normal" style={{ fontSize: "11px" }}>
              {saunaSession.startTimestamp.toLocaleString()}
            </span>
          </div>
          {post?.description && (
            <p
              className="mt-2 mb-0 font-normal text-gray-400"
              style={{ fontSize: "11px" }}
            >
              {post.description}
            </p>
          )}
        </div>
      )}

      {/* Stats Row */}
      {saunaSession && (
        <div className="mt-0 pt-0 pr-3 pb-0 pl-5">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p
                className="mb-1.5 font-normal text-gray-300"
                style={{ fontSize: "11px" }}
              >
                Time
              </p>
              <p
                className="mb-0 leading-none font-bold text-white"
                style={{ fontSize: "19px" }}
              >
                {saunaDuration}
              </p>
            </div>
            {!saunaSession.manual && (
              <>
                <div>
                  <p
                    className="mb-1.5 font-normal text-gray-300"
                    style={{ fontSize: "11px" }}
                  >
                    Avg Temp
                  </p>
                  <p
                    className="mb-0 leading-none font-bold text-white"
                    style={{ fontSize: "19px" }}
                  >
                    {saunaSession.avgTemperature?.toFixed(0)}°
                  </p>
                </div>
                <div>
                  <p
                    className="mb-1.5 font-normal text-gray-300"
                    style={{ fontSize: "11px" }}
                  >
                    Max Temp
                  </p>
                  <p
                    className="mb-0 leading-none font-bold text-white"
                    style={{ fontSize: "19px" }}
                  >
                    {saunaSession.maxTemperature?.toFixed(0)}°
                  </p>
                </div>
                <div>
                  <p
                    className="mb-1.5 font-normal text-gray-300"
                    style={{ fontSize: "11px" }}
                  >
                    Avg Humidity
                  </p>
                  <p
                    className="mb-0 leading-none font-bold text-white"
                    style={{ fontSize: "19px" }}
                  >
                    {saunaSession.avgHumidity?.toFixed(0)}%
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chart and Photos Section */}
      {saunaSession && (
        <div className="scrollbar-hide mt-0 overflow-x-auto">
          <div className="ml-5 flex gap-3 pb-0">
            {/* Chart */}
            {!saunaSession.manual && (
              <div
                className={`flex-shrink-0 ${(post?.images?.length ?? 0 > 0) ? "w-[80%]" : "w-full"}`}
              >
                <SessionChart
                  sessionId={saunaSession.id}
                  key={saunaSession.id}
                />
              </div>
            )}

            {/* Photos section - if available */}
            {post?.images && post.images.length > 0 && (
              <div className="flex flex-shrink-0 gap-3">
                {post.images.map((image: any, index: number) => (
                  <PostImage
                    key={image.id ?? index}
                    image={image}
                    index={index}
                  />
                ))}
              </div>
            )}
            <div className="w-1 flex-shrink-0"></div>
          </div>
        </div>
      )}

      {/* Footer */}
      {post ? (
        <>
          <div
            className={
              "border-t border-[#2C2B36] px-5 pt-4" +
              (!showComments ? " pb-4" : "")
            }
          >
            <div className="flex items-center gap-4">
              <LoylyLikeButton
                liked={!!isLiked}
                onLike={handleLike}
                count={likeCount}
                disabled={!canMutate}
              />
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 transition-colors hover:opacity-80"
              >
                <MessageSquare className="h-5 w-5 stroke-gray-400" />
                <span
                  className="font-normal text-gray-300"
                  style={{ fontSize: "13px" }}
                >
                  {commentCount}
                </span>
              </button>
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/post/${post.id}`;
                  const shareData = {
                    title: `${post.createdBy.name}'s Sauna Session`,
                    text: `Check out ${post.createdBy.name}'s sauna session ${
                      post.name || ""
                    }!`,
                    url,
                  };

                  try {
                    if (navigator.share) {
                      await navigator.share(shareData);
                    } else {
                      // Fallback: copy link to clipboard
                      await navigator.clipboard.writeText(url);
                      alert("Link copied to clipboard!");
                    }
                  } catch (err) {
                    console.log("Error sharing:", err);
                  }
                }}
                className="flex items-center gap-2 transition-colors hover:opacity-80"
              >
                <Share2 className="h-5 w-5 stroke-gray-400" />
              </button>
            </div>
          </div>
          {showComments && (
            <div className="border-t border-[#2C2B36] px-5 pt-3 pb-4">
              <div className="mb-3 space-y-3">
                {displayComments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white font-bold text-black"
                      style={{ fontSize: "11px" }}
                    >
                      {comment.createdBy.name?.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-2">
                        <p
                          className="font-bold text-gray-300"
                          style={{ fontSize: "12px" }}
                        >
                          {comment.createdBy.name}
                        </p>
                        <p
                          className="font-normal text-gray-500"
                          style={{ fontSize: "10px" }}
                        >
                          {timeAgo(comment.createdAt)}
                        </p>
                      </div>
                      <p
                        className="font-normal text-gray-300"
                        style={{ fontSize: "13px" }}
                      >
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
                {!displayComments && (
                  <div className="py-2 text-center text-sm text-gray-500">
                    Loading comments...
                  </div>
                )}
              </div>
              {canMutate ? (
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white font-bold text-black"
                    style={{ fontSize: "11px" }}
                  >
                    {session?.user.name?.charAt(0)}
                  </div>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleCommentSubmit(e)
                    }
                    placeholder="Add a comment..."
                    className="flex-1 border border-[#2C2B36] bg-[#1F1F23] px-3 py-2 font-normal text-gray-300 focus:border-[#D01400] focus:outline-none"
                    style={{ fontSize: "13px" }}
                  />
                  <button
                    onClick={handleCommentSubmit}
                    className="rounded-lg bg-[#D01400] p-2 transition-opacity hover:opacity-80 disabled:opacity-30"
                    disabled={!comment.trim()}
                  >
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  <a href="/login" className="text-white hover:underline">
                    Log in
                  </a>{" "}
                  to like and comment
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="border-t border-[#2C2B36] px-5 py-4">
          <button
            onClick={() => setShowAddPostModal(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2C2B36] py-3 text-sm font-bold text-white transition-colors hover:bg-[#3a3943]"
          >
            <Share2 className="h-4 w-4" />
            Share to Feed
          </button>
        </div>
      )}
      {showAddPostModal && (
        <AddPostModal
          initialState="createPost"
          session={saunaSession}
          onClose={() => setShowAddPostModal(false)}
        />
      )}
    </Card>
  );
}

function PostImage({ image, index }: { image: any; index: number }) {
  // If we already have the URL (e.g. from upload or full post query), use it
  // Otherwise fetch it
  const { data: fetchedImage } = api.post.getImage.useQuery(
    { imageId: image.id },
    { enabled: !image.url && !!image.id },
  );

  const url = image.url ?? fetchedImage?.url;

  if (!url) {
    return (
      <div className="flex h-[240px] w-[240px] flex-shrink-0 items-center justify-center rounded-xl bg-[#2C2B36]">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="h-[240px] w-[240px] flex-shrink-0 overflow-hidden rounded-xl">
      <img
        src={url}
        alt={`Post image ${index + 1}`}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
