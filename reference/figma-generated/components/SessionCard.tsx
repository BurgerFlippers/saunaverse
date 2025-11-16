import { Card } from "./ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  MapPin,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Share2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { LoylyLikeButton } from "./LoylyLikeButton";

interface SessionCardProps {
  session: Session;
  index?: number;
  addProgram: (session: Session) => void;
  savedPrograms: any[];
  removeProgram: (id: number) => void;
}

export function SessionCard({
  session,
  index = 0,
  addProgram,
  savedPrograms,
  removeProgram,
}: SessionCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(session.likes);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [saveButtonAnimate, setSaveButtonAnimate] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Anna K.",
      text: "Looks amazing! 🔥",
      timestamp: "2h ago",
    },
    {
      id: 2,
      user: "Mikko L.",
      text: "Perfect löyly waves!",
      timestamp: "1h ago",
    },
  ]);
  const [shimmerActive, setShimmerActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const removeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if this session is already saved
  const savedProgram = savedPrograms.find(
    (p) =>
      p.savedFrom === session.userName &&
      p.originalSession === (session.notes || "Sauna session"),
  );
  const saved = !!savedProgram;

  // Diagonal shimmer effect on card enter view
  useEffect(() => {
    // Trigger shimmer immediately on mount
    setShimmerActive(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShimmerActive(true);
            // Reset after animation completes
            setTimeout(() => setShimmerActive(false), 1200 + index * 300);
          }
        });
      },
      { threshold: 0.2 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  const handleComment = () => {
    if (commentText.trim()) {
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          user: "You",
          text: commentText,
          timestamp: "Just now",
        },
      ]);
      setCommentText("");
    }
  };

  // Add inSauna indicator to chart data
  const chartDataWithIndicator = session.chartData.map((point, index) => {
    // Simulate being "in sauna" for most of the session, with a break in the middle
    const timeNum = parseInt(point.time);
    const inSauna = !(timeNum >= 15 && timeNum < 20); // Out between 15-20 minutes

    return {
      ...point,
      inSauna: inSauna ? 0 : null, // Use 0 to show at bottom of special Y-axis
    };
  });

  const hasPhotos = session.photos && session.photos.length > 0;

  // Calculate max temperature to determine Y-axis domain
  const maxTemp = Math.max(...session.chartData.map((d) => d.temperature));
  const yAxisDomain = maxTemp > 100 ? [0, 119] : [0, 100];

  // Calculate average temperature from chart data
  const avgTemp = Math.round(
    session.chartData.reduce((sum, d) => sum + d.temperature, 0) /
      session.chartData.length,
  );
  /*
  // Generate achievement display from session data
  const achievement = session.achievement
    ? {
        type: session.achievement.type,
        text: `${session.userName.split(" ")[0]} ${
          session.achievement.metric === "life expectancy"
            ? `increased their ${session.achievement.metric} by ${session.achievement.value} ${session.achievement.unit}`
            : session.achievement.metric === "stress levels"
              ? `lowered their ${session.achievement.metric} by ${session.achievement.value}${session.achievement.unit}`
              : session.achievement.metric === "immune system"
                ? `boosted their ${session.achievement.metric} by ${session.achievement.value}${session.achievement.unit}`
                : session.achievement.metric === "sleep quality"
                  ? `enhanced their ${session.achievement.metric} by ${session.achievement.value}${session.achievement.unit}`
                  : session.achievement.metric === "toxins"
                    ? `released ${session.achievement.value}${session.achievement.unit} of ${session.achievement.metric}`
                    : session.achievement.metric === "inflammation markers"
                      ? `reduced ${session.achievement.metric} by ${session.achievement.value}${session.achievement.unit}`
                      : session.achievement.metric === "calories"
                        ? `burned ${session.achievement.value} ${session.achievement.metric}`
                        : session.achievement.metric === "cardiovascular health"
                          ? `improved their ${session.achievement.metric}`
                          : ""
        }!`,
      }
    : null;
*/
  const achievementColors = {
    gold: "bg-[#FFC533]",
    silver: "bg-[#C0C0C0]",
    bronze: "bg-[#CD7F32]",
  };

  return (
    <div ref={cardRef}>
      <Card
        className={`heat-wave overflow-hidden rounded-3xl border-[#2C2B36] bg-[#1F1F23] ${shimmerActive ? "active" : ""}`}
        style={
          {
            // @ts-ignore - CSS custom property for animation delay
            "--shimmer-delay": `${index * 0.3}s`,
          } as React.CSSProperties
        }
      >
        {/* User Info & Title */}
        <div className="pt-5 pr-3 pb-0 pl-5">
          <div className="mb-0 flex items-start gap-3">
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white font-bold text-black"
              style={{ fontSize: "17px" }}
            >
              {session.userName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="mb-0.5 font-normal text-gray-300"
                style={{ fontSize: "13px" }}
              >
                {session.userName}
              </p>
              <h3
                className="mb-0 leading-tight font-bold text-white"
                style={{ fontSize: "22px" }}
              >
                {session.notes || "Sauna session"}
              </h3>
            </div>
          </div>
        </div>

        {/* Achievement Badge */}
        {achievement && (
          <div
            className={`mt-0 w-full px-5 py-1 ${achievementColors[achievement.type as keyof typeof achievementColors]}`}
          >
            <p
              className="mb-0 font-bold text-black"
              style={{ fontSize: "12px" }}
            >
              🏆 {achievement.text}
            </p>
          </div>
        )}

        {/* Location & Description */}
        <div className="mt-0 pt-0 pr-3 pb-0 pl-5">
          <div className="mb-0.5 flex items-center gap-1 text-gray-400">
            {session.location && (
              <>
                <MapPin className="h-3 w-3" />
                <span className="font-normal" style={{ fontSize: "11px" }}>
                  {session.location} - {session.timestamp}
                </span>
              </>
            )}
          </div>
          {session.description && (
            <p
              className="mb-0 font-normal text-gray-400"
              style={{ fontSize: "11px" }}
            >
              {session.description}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-0 pt-0 pr-3 pb-0 pl-5">
          <div className="grid grid-cols-2 gap-4">
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
                {session.duration}m {session.seconds}s
              </p>
            </div>
            <div>
              <p
                className="mb-1.5 font-normal text-gray-300"
                style={{ fontSize: "11px" }}
              >
                Average temp
              </p>
              <p
                className="mb-0 leading-none font-bold text-white"
                style={{ fontSize: "19px" }}
              >
                {avgTemp}°
              </p>
            </div>
          </div>
        </div>

        {/* Chart and Photos Section */}
        <div className="scrollbar-hide mt-0 overflow-x-auto">
          <div className="flex gap-3 pb-0">
            {/* Chart */}
            <div
              className={`flex-shrink-0 ${hasPhotos ? "w-[85%]" : "w-full"}`}
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={chartDataWithIndicator}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 45,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2C2B36"
                    vertical={false}
                  />

                  {/* Temperature Y-axis (left) */}
                  <YAxis
                    yAxisId="temp"
                    orientation="left"
                    domain={[0, 100]}
                    hide={true}
                  />

                  {/* Temperature Y-axis (right) - visible */}
                  <YAxis
                    yAxisId="temp"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#BFC5CA" }}
                    stroke="transparent"
                    domain={yAxisDomain}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    width={35}
                  />

                  {/* Hidden Y-axis for in-sauna indicator (at bottom) */}
                  <YAxis yAxisId="inSauna" domain={[0, 1]} hide={true} />

                  {/* X-axis */}
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: "#BFC5CA" }}
                    stroke="transparent"
                    tickLine={false}
                    tickFormatter={(value) => `${value}min`}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#1F1F23",
                      border: "1px solid #2C2B36",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#F5E6D0",
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === "inSauna") return null;
                      return [
                        `${value}${name === "temperature" ? "°" : "%"}`,
                        name === "temperature" ? "Temperature" : "Humidity",
                      ];
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "#BFC5CA",
                    }}
                    iconType="line"
                    formatter={(value, entry) => {
                      // Only show temperature and humidity, skip 'inSauna'
                      if (value === "temperature") return "Temp (°C)";
                      if (value === "humidity") return "Humidity (%)";
                      return "IN sauna"; // skip all others
                    }}
                  />

                  {/* In-Sauna indicator line */}
                  <Line
                    type="stepAfter"
                    dataKey="inSauna"
                    stroke="#D01400"
                    strokeWidth={4}
                    dot={false}
                    strokeLinecap="round"
                    isAnimationActive={false}
                    yAxisId="inSauna"
                    legendType="none"
                    opacity={0.6}
                  />

                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#D01400"
                    strokeWidth={3}
                    dot={false}
                    name="temperature"
                  />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#BFC5CA"
                    strokeWidth={3}
                    dot={false}
                    name="humidity"
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Legend for in-sauna indicator */}
              <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 rounded bg-[#D01400] opacity-60"></div>
                  <span className="font-normal">In sauna</span>
                </div>
              </div>
            </div>

            {/* Photos section - if available */}
            {hasPhotos && (
              <div className="flex flex-shrink-0 gap-3">
                {session.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="h-[240px] w-[240px] flex-shrink-0 overflow-hidden rounded-xl"
                  >
                    <ImageWithFallback
                      src={photo}
                      alt={`Session photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#2C2B36] px-5 pt-2 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LoylyLikeButton liked={liked} onLike={handleLike} />
              <span
                className="font-normal text-gray-300"
                style={{ fontSize: "13px" }}
              >
                {likeCount}
              </span>
            </div>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 transition-colors hover:opacity-80"
            >
              <MessageCircle className="h-5 w-5 stroke-gray-400" />
              <span
                className="font-normal text-gray-300"
                style={{ fontSize: "13px" }}
              >
                {comments.length}
              </span>
            </button>
            <button
              onClick={() => {
                if (!saved) {
                  // Add to programs with animation
                  setShowSavedMessage(true);
                  setSaveButtonAnimate(true);
                  setTimeout(() => setShowSavedMessage(false), 2000);
                  setTimeout(() => setSaveButtonAnimate(false), 300);
                  addProgram(session);
                } else if (showRemoveConfirm) {
                  // Second click within 3 seconds - confirm removal
                  if (removeTimerRef.current) {
                    clearTimeout(removeTimerRef.current);
                  }
                  setShowRemoveConfirm(false);
                  // Remove the saved program
                  if (savedProgram) {
                    removeProgram(savedProgram.id);
                  }
                } else {
                  // First click - show remove confirmation
                  setShowRemoveConfirm(true);
                  // Auto-cancel after 3 seconds if not clicked again
                  removeTimerRef.current = setTimeout(() => {
                    setShowRemoveConfirm(false);
                  }, 3000);
                }
              }}
              className={`flex items-center gap-2 transition-colors hover:opacity-80 ${saveButtonAnimate ? "save-button-click" : ""}`}
            >
              <Bookmark
                className={`h-5 w-5 ${saved ? "fill-[#FF7A28] stroke-[#FF7A28]" : "stroke-gray-400"}`}
              />
              {showSavedMessage && (
                <span
                  className="saved-message font-bold text-[#FF7A28]"
                  style={{ fontSize: "13px" }}
                >
                  Added to Programs
                </span>
              )}
              {showRemoveConfirm && (
                <span
                  className="font-bold text-[#FF7A28]"
                  style={{ fontSize: "13px" }}
                >
                  Tap again to remove
                </span>
              )}
            </button>
            <button
              onClick={async () => {
                const shareData = {
                  title: `${session.userName}'s Sauna Session`,
                  text: `Check out ${session.userName}'s sauna session ${session.notes || ""}!`,
                  url: window.location.href,
                };

                try {
                  if (navigator.share) {
                    await navigator.share(shareData);
                  } else {
                    // Fallback: copy link to clipboard
                    await navigator.clipboard.writeText(window.location.href);
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

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-[#2C2B36] px-5 pt-3 pb-4">
            {/* Comments List */}
            <div className="mb-3 space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white font-bold text-black"
                    style={{ fontSize: "11px" }}
                  >
                    {comment.user.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <p
                        className="font-bold text-gray-300"
                        style={{ fontSize: "12px" }}
                      >
                        {comment.user}
                      </p>
                      <p
                        className="font-normal text-gray-500"
                        style={{ fontSize: "10px" }}
                      >
                        {comment.timestamp}
                      </p>
                    </div>
                    <p
                      className="font-normal text-gray-300"
                      style={{ fontSize: "13px" }}
                    >
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white font-bold text-black"
                style={{ fontSize: "11px" }}
              >
                Y
              </div>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
                placeholder="Add a comment..."
                className="flex-1 border border-[#2C2B36] bg-[#1F1F23] px-3 py-2 font-normal text-gray-300 focus:border-[#D01400] focus:outline-none"
                style={{ fontSize: "13px" }}
              />
              <button
                onClick={handleComment}
                className="rounded-lg bg-[#D01400] p-2 transition-opacity hover:opacity-80 disabled:opacity-30"
                disabled={!commentText.trim()}
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
