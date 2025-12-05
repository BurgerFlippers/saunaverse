"use client";

import { useEffect, useState } from "react";
import { Plus, X, MapPin, Calendar, Check, ChevronsUpDown } from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { SessionChart } from "./SessionChart";
import { formatDuration, generateSessionTitle, cn } from "./ui/utils";
import type { Sauna, SaunaSession } from "generated/prisma/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

export type ModalState =
  | "selectAction"
  | "selectSession"
  | "createSession"
  | "createPost";

type AddPostModalProps = {
  initialState: ModalState;
  onClose: (sessionCreated?: boolean) => void;
  session?: SaunaSession & { sauna: Sauna };
};

export function AddPostModal({
  initialState,
  onClose,
  session,
}: AddPostModalProps) {
  const [state, setState] = useState<ModalState>(initialState);
  const [selectedSession, setSelectedSession] = useState<
    (SaunaSession & { sauna: Sauna }) | null
  >(session || null);
  const [name, setName] = useState("");
  const [generatedName, setGeneratedName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const [manualSessionSauna, setManualSessionSauna] = useState<Sauna | null>(
    null,
  );
  const [manualSessionDate, setManualSessionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [manualSessionTime, setManualSessionTime] = useState(
    new Date().toTimeString().split(" ")[0]?.substring(0, 5),
  );
  const [manualSessionDuration, setManualSessionDuration] = useState("60");
  const [manualSessionTemperature, setManualSessionTemperature] = useState("");
  const [shareImmediately, setShareImmediately] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [newSaunaName, setNewSaunaName] = useState("");

  const router = useRouter();
  const utils = api.useUtils();

  const { data: saunas } = api.sauna.getSaunas.useQuery();
  const { data: sessions } = api.sauna.getMySessionsAndPosts.useQuery(
    undefined,
    {
      enabled: state === "selectSession",
    },
  );

  useEffect(() => {
    if (
      state === "createSession" &&
      saunas &&
      saunas.length > 0 &&
      !manualSessionSauna
    ) {
      setManualSessionSauna(saunas[0]!);
    }
  }, [state, saunas, manualSessionSauna]);

  const { data: measurements } = api.sauna.getSaunaSessionMeasurements.useQuery(
    {
      saunaSessionId: selectedSession?.id ?? "",
    },
    {
      enabled: !!selectedSession,
    },
  );

  useEffect(() => {
    if (selectedSession && !name) {
      setGeneratedName(
        generateSessionTitle(
          selectedSession.startTimestamp,
          selectedSession.id,
          selectedSession.avgTemperature,
        ),
      );
    }
  }, [selectedSession, name]);

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      utils.post.getFeed.invalidate();
      utils.sauna.getMySessionsAndPosts.invalidate();
      onClose(true);
    },
  });

  const createManualSession = api.sauna.createManualSession.useMutation({
    onSuccess: (newSession) => {
      utils.sauna.getMySessionsAndPosts.invalidate();
      if (shareImmediately) {
        setSelectedSession({ ...newSession, sauna: manualSessionSauna! });
        setState("createPost");
      } else {
        router.refresh();
        onClose(true);
      }
    },
  });

  const createSauna = api.sauna.createSauna.useMutation({
    onSuccess: (newSauna) => {
      utils.sauna.getSaunas.invalidate();
      setManualSessionSauna(newSauna);
      setOpenCombobox(false);
      setNewSaunaName("");
    },
  });

  const filteredSaunas =
    newSaunaName === ""
      ? saunas
      : saunas?.filter((sauna) =>
          sauna.name.toLowerCase().includes(newSaunaName.toLowerCase()),
        );

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

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
      name: name || generatedName,
      description,
      saunaSessionId: selectedSession.id,
      images: imageUrls,
    });
  };

  const handleCreateManualSession = (
    e: React.FormEvent,
    shouldShare = false,
  ) => {
    e.preventDefault();
    if (!manualSessionSauna) return;

    setShareImmediately(shouldShare);

    const startTimestamp = new Date(
      `${manualSessionDate}T${manualSessionTime}`,
    );
    const durationInMinutes = parseInt(manualSessionDuration, 10);
    const endTimestamp = new Date(
      startTimestamp.getTime() + durationInMinutes * 60000,
    );

    createManualSession.mutate({
      saunaId: manualSessionSauna.id,
      startTimestamp,
      endTimestamp,
      durationMs: durationInMinutes * 60000,
      temperature: manualSessionTemperature
        ? parseFloat(manualSessionTemperature)
        : undefined,
    });
  };

  const renderContent = () => {
    switch (state) {
      case "selectAction":
        return (
          <div>
            <h3 className="text-center text-lg font-bold">
              What would you like to do?
            </h3>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setState("selectSession")}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Create post from a session
              </button>
              <button
                onClick={() => setState("createSession")}
                className="rounded-lg bg-green-600 px-4 py-2 text-white"
              >
                Log a new manual session
              </button>
            </div>
          </div>
        );
      case "selectSession":
        const unpostedSessions = sessions?.filter(
          (session) => session.posts.length === 0,
        );
        return (
          <div>
            <div className="max-h-64 w-full overflow-y-auto">
              <div
                onClick={() => {
                  setShareImmediately(true);
                  setState("createSession");
                }}
                className="cursor-pointer border-b border-gray-700 p-4 hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white">
                      Log new manual session
                    </p>
                    <p className="text-sm text-gray-400">
                      Create and share a new session
                    </p>
                  </div>
                </div>
              </div>
              {unpostedSessions?.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session as any);
                    setGeneratedName(
                      generateSessionTitle(
                        session.startTimestamp,
                        session.id,
                        session.avgTemperature,
                      ),
                    );
                    setState("createPost");
                  }}
                  className="cursor-pointer p-4 hover:bg-gray-800"
                >
                  <p className="font-bold text-white">
                    {generateSessionTitle(
                      session.startTimestamp,
                      session.id,
                      session.avgTemperature,
                    )}
                  </p>
                  <p className="text-sm text-gray-400">
                    {session.sauna.name} •{" "}
                    {new Date(session.startTimestamp).toLocaleString()}
                  </p>
                  <span>
                    {session.endTimestamp
                      ? formatDuration(
                          new Date(session.endTimestamp).getTime() -
                            new Date(session.startTimestamp).getTime(),
                        )
                      : "ongoing"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case "createSession":
        return (
          <form onSubmit={(e) => handleCreateManualSession(e, false)}>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Sauna
              </label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between border-gray-600 bg-gray-800 text-white hover:bg-gray-700 hover:text-white"
                  >
                    {manualSessionSauna
                      ? manualSessionSauna.name
                      : "Select sauna..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command
                    shouldFilter={false}
                    className="bg-[#1F1F23] text-white"
                  >
                    <CommandInput
                      placeholder="Search sauna..."
                      className="border-none text-white placeholder:text-gray-500"
                      onValueChange={setNewSaunaName}
                      value={newSaunaName}
                    />
                    <CommandList>
                      <CommandEmpty>No saunas found.</CommandEmpty>
                      <CommandGroup>
                        {filteredSaunas?.map((sauna) => (
                          <CommandItem
                            key={sauna.id}
                            value={sauna.name}
                            onSelect={() => {
                              setManualSessionSauna(sauna);
                              setOpenCombobox(false);
                            }}
                            className="text-white aria-selected:bg-gray-800 aria-selected:text-white"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                manualSessionSauna?.id === sauna.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {sauna.name}
                          </CommandItem>
                        ))}
                        <CommandSeparator className="my-1 bg-gray-500" />
                        <CommandItem
                          value="create-sauna-trigger"
                          onSelect={() => {
                            if (newSaunaName) {
                              createSauna.mutate({
                                name: newSaunaName,
                                location: newSaunaName,
                              });
                            }
                          }}
                          className={cn(
                            "cursor-pointer text-white aria-selected:bg-gray-800 aria-selected:text-white",
                            !newSaunaName && "cursor-default opacity-50",
                          )}
                          disabled={!newSaunaName}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          <span className="font-bold">
                            {newSaunaName
                              ? `Create "${newSaunaName}"`
                              : "Type to add new normal sauna..."}
                          </span>
                        </CommandItem>
                        <CommandItem
                          value="connect-harvia"
                          onSelect={() => {
                            router.push("/setup/sauna?type=harvia");
                          }}
                          className="cursor-pointer aria-selected:bg-gray-800 aria-selected:text-white"
                        >
                          <span className="font-bold">
                            Add new{" "}
                            <img
                              src="/harvia-logo.png"
                              alt="Harvia"
                              className="inline-block h-[1em] w-auto object-contain align-middle"
                            />{" "}
                            Smart Sauna
                          </span>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={manualSessionDate}
                  onChange={(e) => setManualSessionDate(e.target.value)}
                  className="mt-1 w-full rounded bg-gray-800 p-2"
                />
              </div>
              <div>
                <label>Time</label>
                <input
                  type="time"
                  value={manualSessionTime}
                  onChange={(e) => setManualSessionTime(e.target.value)}
                  className="mt-1 w-full rounded bg-gray-800 p-2"
                />
              </div>
              <div>
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={manualSessionDuration}
                  onChange={(e) => setManualSessionDuration(e.target.value)}
                  className="mt-1 w-full rounded bg-gray-800 p-2"
                />
              </div>
              <div>
                <label>Temperature (°C)</label>
                <input
                  type="number"
                  value={manualSessionTemperature}
                  onChange={(e) => setManualSessionTemperature(e.target.value)}
                  className="mt-1 w-full rounded bg-gray-800 p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={(e) => handleCreateManualSession(e, false)}
                className="flex-1 cursor-pointer rounded-xl bg-[#2C2B36] px-6 py-3 font-bold text-white transition-colors hover:bg-[#3a3943]"
                disabled={createManualSession.isPending}
              >
                {createManualSession.isPending && !shareImmediately
                  ? "Logging..."
                  : "Log Only"}
              </button>
              <button
                type="button"
                onClick={(e) => handleCreateManualSession(e, true)}
                className="flex-1 cursor-pointer rounded-xl bg-[#D01400] px-6 py-3 font-bold text-white transition-colors hover:bg-[#FF7A28]"
                disabled={createManualSession.isPending}
              >
                {createManualSession.isPending && shareImmediately
                  ? "Logging..."
                  : "Log & Share"}
              </button>
            </div>
          </form>
        );
      case "createPost":
        if (!selectedSession) return null;
        return (
          <form onSubmit={handleCreatePost}>
            <div className="mb-4">
              <input
                type="text"
                placeholder={generatedName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-none bg-transparent px-0 py-0 font-bold text-white placeholder:text-gray-600 focus:outline-none"
                style={{ fontSize: "22px" }}
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
            <div className="relative mt-1 mb-0 w-full rounded-lg border-0">
              <div className="mb-0.5 flex items-center gap-1 text-gray-400">
                <MapPin className="h-3 w-3" />
                <span className="font-normal" style={{ fontSize: "11px" }}>
                  {selectedSession.sauna.name}
                </span>
              </div>
              <div className="mb-0.5 flex items-center gap-1 text-gray-400">
                <Calendar className="h-3 w-3" />
                <span className="font-normal" style={{ fontSize: "11px" }}>
                  {selectedSession.startTimestamp.toLocaleString()}
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
                    {selectedSession.endTimestamp
                      ? formatDuration(
                          new Date(selectedSession.endTimestamp).getTime() -
                            new Date(selectedSession.startTimestamp).getTime(),
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
                    {selectedSession.avgTemperature?.toFixed(0)}°
                  </p>
                </div>
                {selectedSession.maxTemperature && (
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
                      {selectedSession.maxTemperature?.toFixed(0)}°
                    </p>
                  </div>
                )}
                {selectedSession.avgHumidity && (
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
                      {selectedSession.avgHumidity?.toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
              {measurements && !selectedSession?.manual && (
                <SessionChart measurements={measurements} />
              )}
            </div>
            <p className="mt-2 mb-2 block text-sm font-medium text-gray-300">
              Add images
            </p>
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
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => onClose()}
                className="flex-1 cursor-pointer rounded-xl bg-[#2C2B36] px-6 py-3 font-bold text-white transition-colors hover:bg-[#3a3943]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 cursor-pointer rounded-xl bg-[#D01400] px-6 py-3 font-bold text-white transition-colors hover:bg-[#FF7A28]"
                disabled={createPost.isPending}
              >
                {createPost.isPending ? "Sharing..." : "Share Session"}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#2C2B36] bg-[#1F1F23]">
        <div className="flex items-center justify-between border-b border-[#2C2B36] px-5 py-4">
          <h2 className="text-xl font-bold">
            {state === "createPost" && "Share your session"}
            {state === "createSession" && "Log a manual session"}
            {state === "selectSession" && "Select session to share"}
            {state === "selectAction" && "Add a post"}
          </h2>
          <button
            onClick={() => onClose()}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-5">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
