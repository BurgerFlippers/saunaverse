"use client";

import { useState } from "react";
import { Plus, X, MapPin, Replace, List, Calendar } from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { MemoizedSessionChart, SessionChart } from "./SessionChart";
import { useEffect } from "react";
import { formatDuration } from "./ui/utils";

import type { Sauna, SaunaSession } from "generated/prisma/client";

type AddPostModalProps = {
  session?: SaunaSession & { sauna: Sauna };
  onClose: () => void;
};

export function AddPostModal({
  session: initialSession,
  onClose,
}: AddPostModalProps) {
  const [step, setStep] = useState(initialSession ? 3 : 1);
  const [selectedSauna, setSelectedSauna] = useState<Sauna | null>(null);
  const [session, setSession] = useState(initialSession);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualSession, setManualSession] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0]?.substring(0, 5),
    duration: "60",
  });
  const { data: saunas } = api.sauna.getSaunas.useQuery();
  const { data: unpostedSessions } = api.user.getUnpostedSessions.useQuery(
    undefined,
    {
      enabled: !!selectedSauna,
    },
  );
  const { data: measurements } = api.sauna.getSaunaSessionMeasurements.useQuery(
    {
      saunaSessionId: session?.id ?? "",
    },
    {
      enabled: !!session,
    },
  );
  const router = useRouter();
  const utils = api.useUtils();

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      utils.post.getFeed.invalidate();
      router.refresh();
      onClose();
    },
  });

  const createManualSession = api.sauna.createManualSession.useMutation({
    onSuccess: async (data) => {
      const imageUrls = await Promise.all(
        images.map((image) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(image);
          });
        }),
      );
      createPost.mutate({
        name,
        description,
        saunaSessionId: data.id,
        images: imageUrls,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isManualEntry) {
      const startTimestamp = new Date(
        `${manualSession.date}T${manualSession.time}`,
      );
      const durationInMinutes = parseInt(manualSession.duration, 10);
      const endTimestamp = new Date(
        startTimestamp.getTime() + durationInMinutes * 60000,
      );
      createManualSession.mutate({
        saunaId: selectedSauna!.id,
        startTimestamp,
        endTimestamp,
        durationMs: durationInMinutes * 60000,
      });
    } else {
      const imageUrls = await Promise.all(
        images.map((image) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(image);
          });
        }),
      );
      createPost.mutate({
        name,
        description,
        saunaSessionId: session?.id,
        images: imageUrls,
      });
    }
  };

  const renderStepOne = () => {
    if (!saunas?.length) {
      return (
        <div className="text-center">
          <p>No saunas found.</p>
          <button
            onClick={() => router.push("/setup/sauna")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Set Up a Sauna
          </button>
        </div>
      );
    }
    return (
      <div>
        <h3 className="text-lg font-bold">Select a Sauna</h3>
        <div className="grid grid-cols-2 gap-4">
          {saunas?.map((sauna) => (
            <div
              key={sauna.id}
              onClick={() => {
                setSelectedSauna(sauna);
                if (sauna.harviaDeviceId) {
                  setStep(2);
                } else {
                  setIsManualEntry(true);
                  setStep(3);
                }
              }}
              className="cursor-pointer rounded-lg bg-gray-800 p-4 text-center"
            >
              {sauna.name}
              {!sauna.harviaDeviceId && (
                <span className="ml-2 text-xs text-gray-400">(manual)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStepTwo = () => {
    if (!selectedSauna) return null;
    return (
      <div>
        <h3 className="text-lg font-bold">Select a Session</h3>
        <div className="max-h-64 w-full overflow-y-auto">
          <div
            onClick={() => {
              setIsManualEntry(true);
              setStep(3);
            }}
            className="cursor-pointer p-4 hover:bg-gray-800"
          >
            <p className="font-bold text-white">Manual Entry</p>
          </div>
          {unpostedSessions
            ?.filter((s) => s.saunaId === selectedSauna.id && s.endTimestamp)
            .map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setSession(s);
                  setStep(3);
                }}
                className="cursor-pointer p-4 hover:bg-gray-800"
              >
                <p className="font-bold text-white">{s.sauna.name}</p>
                <p className="text-sm text-gray-400">
                  {new Date(s.startTimestamp).toLocaleString()}
                </p>
                <span>
                  {s.endTimestamp
                    ? formatDuration(
                        new Date(s.endTimestamp).getTime() -
                          new Date(s.startTimestamp).getTime(),
                      )
                    : "ongoing"}
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderStepThree = () => (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Perfect evening löyly session"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-none bg-transparent px-0 py-0 font-bold text-white placeholder:text-gray-600 focus:outline-none"
          style={{ fontSize: "22px" }}
          required
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          placeholder="The heat was intense but perfect. Started gentle, built up gradually..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full resize-none border-none bg-transparent px-0 py-0 font-normal text-gray-400 placeholder:text-gray-600 focus:outline-none"
        />
      </div>
      <div className="relative mb-0 w-full rounded-lg border-0">
        {isManualEntry ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={manualSession.date}
                onChange={(e) =>
                  setManualSession({ ...manualSession, date: e.target.value })
                }
                className="w-full rounded bg-gray-800 p-2"
              />
            </div>
            <div>
              <label>Time</label>
              <input
                type="time"
                value={manualSession.time}
                onChange={(e) =>
                  setManualSession({ ...manualSession, time: e.target.value })
                }
                className="w-full rounded bg-gray-800 p-2"
              />
            </div>
            <div>
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={manualSession.duration}
                onChange={(e) =>
                  setManualSession({
                    ...manualSession,
                    duration: e.target.value,
                  })
                }
                className="w-full rounded bg-gray-800 p-2"
              />
            </div>
          </div>
        ) : (
          session &&
          measurements && (
            <>
              <div className="mb-0.5 flex items-center gap-1 text-gray-400">
                <MapPin className="h-3 w-3" />
                <span className="font-normal" style={{ fontSize: "11px" }}>
                  {session.sauna.name}
                </span>
              </div>
              <div className="mb-0.5 flex items-center gap-1 text-gray-400">
                <Calendar className="h-3 w-3" />
                <span className="font-normal" style={{ fontSize: "11px" }}>
                  {session.startTimestamp.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 pt-2">
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
                    {session.endTimestamp
                      ? formatDuration(
                          new Date(session.endTimestamp).getTime() -
                            new Date(session.startTimestamp).getTime(),
                        )
                      : "Ongoing"}
                  </p>
                </div>
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
                    {session.avgTemperature?.toFixed(0)}°
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
                    {session.maxTemperature?.toFixed(0)}°
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
                    {session.avgHumidity?.toFixed(0)}%
                  </p>
                </div>
              </div>
              <MemoizedSessionChart measurements={measurements} />
            </>
          )
        )}
      </div>
      <p className="mb-2 block text-sm font-medium text-gray-300">Add images</p>
      <div className="scrollbar-hide mt-0 overflow-x-auto">
        <div className="flex gap-3 pb-0">
          {images.map((image, index) => (
            <div
              key={index}
              className="h-[100px] w-[100px] flex-shrink-0 overflow-hidden rounded-xl"
            >
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          <div className="h-[100px] w-[100px] flex-shrink-0">
            <label
              htmlFor="images"
              className="flex h-full w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-600 text-gray-600 hover:border-gray-500 hover:text-gray-500"
            >
              <Plus className="h-8 w-8" />
              <input
                type="file"
                id="images"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setImages([...images, ...Array.from(e.target.files)]);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#2C2B36] bg-[#1F1F23]">
        <div className="flex items-center justify-between border-b border-[#2C2B36] px-5 py-4">
          <h2 className="mb-0" style={{ fontSize: "22px" }}>
            Share Your Sauna Session
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex h-full max-h-[80vh] flex-col"
        >
          <div className="overflow-y-auto p-5">
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
          </div>
          <div className="flex gap-3 border-t border-[#2C2B36] p-5">
            {step > 1 && !initialSession && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 cursor-pointer rounded-xl bg-[#2C2B36] px-6 py-3 font-bold text-white transition-colors hover:bg-[#3a3943]"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl bg-[#2C2B36] px-6 py-3 font-bold text-white transition-colors hover:bg-[#3a3943]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 cursor-pointer rounded-xl bg-[#D01400] px-6 py-3 font-bold text-white transition-colors hover:bg-[#FF7A28]"
              disabled={createPost.isPending || (!isManualEntry && !session)}
            >
              {createPost.isPending ? "Sharing..." : "Share Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
