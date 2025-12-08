import { ImageResponse } from "@vercel/og";
import { db } from "@/server/db";

// Use Node.js runtime to ensure Prisma Client compatibility
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return new Response("Missing id", { status: 400 });
    }

    const post = await db.post.findUnique({
      where: { id: parseInt(postId) },
      include: {
        saunaSession: {
          include: {
            sauna: true,
          },
        },
        createdBy: true,
      },
    });

    if (!post || !post.saunaSession) {
      return new Response("Post not found", { status: 404 });
    }

    // Fetch measurements for the chart
    const measurements = await db.saunaMeasurement.findMany({
      where: {
        saunaId: post.saunaSession.saunaId,
        timestamp: {
          gte: post.saunaSession.startTimestamp,
          lte: post.saunaSession.endTimestamp ?? new Date(),
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    // Simplify data for the chart (just 20 points for OG image)
    const chartPoints = measurements
      .filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 20)) === 0)
      .map((m) => m.temperature);

    const maxTemp = Math.max(...chartPoints, 80);
    const minTemp = Math.min(...chartPoints, 20);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1F1F23",
            color: "white",
            fontFamily: "sans-serif",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 30, color: "#9ca3af" }}>
                {post.createdBy.name}
              </div>
              <div style={{ fontSize: 60, fontWeight: "bold" }}>
                {post.name || "Sauna Session"}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                backgroundColor: "#D01400",
                padding: "10px 20px",
                borderRadius: "20px",
                fontSize: 30,
                fontWeight: "bold",
              }}
            >
              {post.saunaSession.avgTemperature?.toFixed(0)}°C
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              height: "300px",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "5px",
            }}
          >
            {chartPoints.map((temp, i) => {
              const heightPercentage =
                ((temp - minTemp) / (maxTemp - minTemp)) * 80 + 20;
              return (
                <div
                  key={i}
                  style={{
                    height: `${heightPercentage}%`,
                    width: "100%",
                    backgroundColor: "#FF7A28",
                    borderRadius: "4px",
                    opacity: 0.8,
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              marginTop: "20px",
              fontSize: 24,
              color: "#9ca3af",
            }}
          >
            <div>{post.saunaSession.sauna.name}</div>
            <div>
              {post.saunaSession.startTimestamp.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}