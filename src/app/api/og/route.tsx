import { ImageResponse } from "@vercel/og";
import { db } from "@/server/db";
import { smoothData } from "@/app/_components/ui/utils";

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

    const chartData = smoothData(measurements, 5);

    if (chartData.length === 0) {
      // Fallback or empty state if no data
      return new Response("No chart data available", { status: 404 });
    }

    // Calculate ranges for scaling
    const temperatures = chartData.map((d) => d.temperature);
    // const humidities = chartData.map(d => d.humidity);

    const minTemp = 0;
    const maxTemp = Math.max(...temperatures, 100);
    // Add some padding to the range so the line doesn't touch the edges exactly
    const tempPadding = (maxTemp - minTemp) * 0.1 || 5;
    const yMin = 0;
    const yMax = maxTemp + tempPadding;

    const width = 1200;
    const height = 300; // Chart height
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Coordinate conversion function
    const getX = (index: number) => {
      return padding + (index / (chartData.length - 1)) * chartWidth;
    };

    const getY = (value: number) => {
      // Invert Y because SVG coordinates start from top
      const normalized = (value - yMin) / (yMax - yMin);
      return chartHeight - normalized * chartHeight;
    };

    // Generate path data for lines
    let tempPathData = "";
    let humidityPathData = "";

    // Create line path
    if (chartData.length > 1) {
      tempPathData = `M ${getX(0)} ${getY(chartData[0]!.temperature)}`;
      humidityPathData = `M ${getX(0)} ${getY(chartData[0]!.humidity)}`;
      for (let i = 1; i < chartData.length; i++) {
        // Simple line for now, could do bezier curves for smoothness but linear is safer for raw data
        tempPathData += ` L ${getX(i)} ${getY(chartData[i]!.temperature)}`;
        humidityPathData += ` L ${getX(i)} ${getY(chartData[i]!.humidity)}`;
      }
    }

    // Create in-sauna blocks (rectangles at the bottom or background)
    // We'll draw them as a filled area at the bottom of the chart
    const inSaunaBlocks: { start: number; end: number }[] = [];
    let currentBlockStart = -1;

    for (let i = 0; i < chartData.length; i++) {
      if (chartData[i]!.precence > 0) {
        if (currentBlockStart === -1) currentBlockStart = i;
      } else {
        if (currentBlockStart !== -1) {
          inSaunaBlocks.push({ start: currentBlockStart, end: i - 1 });
          currentBlockStart = -1;
        }
      }
    }
    // Close last block if open
    if (currentBlockStart !== -1) {
      inSaunaBlocks.push({
        start: currentBlockStart,
        end: chartData.length - 1,
      });
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "630px",
            width: "1200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#1F1F23",
            color: "white",
            fontFamily: "sans-serif",
            padding: "40px",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-start",
              zIndex: "10",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                {/* Avatar placeholder if we had image url */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "white",
                    color: "#1F1F23",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 30,
                    fontWeight: "bold",
                    marginRight: 20,
                  }}
                >
                  {post.createdBy.name?.charAt(0) || "U"}
                </div>
                <div style={{ fontSize: 30, color: "#9ca3af" }}>
                  {post.createdBy.name}
                </div>
              </div>

              <div
                style={{ fontSize: 60, fontWeight: "bold", lineHeight: 1.1 }}
              >
                {post.name || "Sauna Session"}
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: "#9ca3af",
                  marginTop: 10,
                  display: "none",
                }}
              >
                {post.saunaSession.sauna.name} •{" "}
                {post.saunaSession.startTimestamp.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Stats Box */}
            <div style={{ display: "flex", gap: 40 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <span style={{ fontSize: 24, color: "#9ca3af" }}>Time</span>
                <span style={{ fontSize: 48, fontWeight: "bold" }}>
                  {post.saunaSession.durationMs
                    ? Math.round(post.saunaSession.durationMs / 60000) + "m"
                    : "N/A"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <span style={{ fontSize: 24, color: "#9ca3af" }}>Avg Temp</span>
                <span style={{ fontSize: 48, fontWeight: "bold" }}>
                  {post.saunaSession.avgTemperature?.toFixed(0)}°C
                </span>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div
            style={{
              display: "flex",
              width: chartWidth,
              height: chartHeight,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                height: chartHeight,
                top: 0,
                left: 0,
                right: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {[0, 20, 40, 60, 80, 100].map((tick) => {
                const y = getY(tick);
                return (
                  <div
                    key={tick}
                    style={{
                      position: "absolute",
                      top: y,
                      width: chartWidth,
                      height: 1,
                      backgroundColor: "#2C2B36",
                      display: "flex",
                      alignItems: "center",
                    }}
                  ></div>
                );
              })}
            </div>
            {/* Y-Axis Labels */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: -40,
                height: chartHeight,
                width: 30,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {[0, 20, 40, 60, 80, 100].map((tick) => {
                const y = getY(tick);
                return (
                  <div
                    key={tick}
                    style={{
                      position: "absolute",
                      top: y - 12,
                      left: 0,
                      fontSize: 16,
                      color: "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {tick}
                  </div>
                );
              })}
            </div>

            {/* SVG Chart */}
            <svg
              width={chartWidth}
              height={height}
              viewBox={`0 0 ${chartWidth} ${height}`}
              style={{ overflow: "visible" }}
            >
              {/* In-Sauna Blocks */}
              {inSaunaBlocks.map((block, i) => {
                const xStart = getX(block.start);
                const xEnd = getX(block.end);
                const blockWidth = Math.max(xEnd - xStart, 2); // Ensure minimal visibility
                return (
                  <rect
                    key={i}
                    x={xStart}
                    y={chartHeight - 5} // Bottom strip
                    width={blockWidth}
                    height={5}
                    fill="#a7544bff"
                    opacity={0.8}
                  />
                );
              })}

              {/* Temperature Line */}
              <path
                d={tempPathData}
                fill="none"
                stroke="#D01400"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={humidityPathData}
                fill="none"
                stroke="#BFC5CA"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Legend Overlay (Optional) */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "flex",
                gap: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: "#BFC5CA",
                    borderRadius: 2,
                  }}
                ></div>
                <span style={{ fontSize: 16, color: "#BFC5CA" }}>Humidity</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: "#D01400",
                    borderRadius: 2,
                  }}
                ></div>
                <span style={{ fontSize: 16, color: "#BFC5CA" }}>Temp</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: "#a7544bff",
                    borderRadius: 2,
                  }}
                ></div>
                <span style={{ fontSize: 16, color: "#BFC5CA" }}>In Sauna</span>
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: 20,
              borderTop: "1px solid #2C2B36",
              paddingTop: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20, color: "#9ca3af" }}>
                Tracked with
              </span>
              <span style={{ fontSize: 20, fontWeight: "bold" }}>
                Saunaverse
              </span>
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
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
