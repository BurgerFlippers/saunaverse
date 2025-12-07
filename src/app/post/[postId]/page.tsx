import { api } from "@/trpc/server";
import { PostCard } from "@/app/_components/PostCard";
import { redirect } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/server/auth";

type Props = {
  params: { postId: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const id = parseInt(params.postId);

  if (isNaN(id)) {
    return {
      title: "Post not found",
    };
  }

  const post = await api.post.getById({ id });

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const postImage = post.images?.[0]?.url;

  return {
    title: `${post.createdBy.name}'s Sauna Session | Saunaverse`,
    description: `Check out ${post.createdBy.name}'s sauna session: ${post.description || "A great session!"}`,
    openGraph: {
      images: postImage ? [postImage, ...previousImages] : previousImages,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const id = parseInt(params.postId);

  if (isNaN(id)) {
    redirect("/");
  }

  const post = await api.post.getById({ id });
  const session = await auth();

  if (!post) {
    redirect("/");
  }

  return (
    <main className="flex flex-col gap-8 text-white">
      <div className="mx-auto max-w-lg px-4 pt-6">
        <PostCard post={post} session={post.saunaSession} />

        {!session && (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-[#2C2B36] bg-[#1F1F23] p-6 text-center">
            <div>
              <h2 className="text-xl font-bold text-white">Join Saunaverse</h2>
              <p className="mt-2 text-sm text-gray-400">
                Track your sauna sessions, compete with friends, and visualize
                your health stats.
              </p>
            </div>

            <Link
              href="/setup"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D01400] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#b01100]"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
