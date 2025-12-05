"use client";

import { useState, useEffect, Suspense } from "react";
import { api } from "@/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";

const deviceNameBlacklist: string[] = ["MiniSaunaSens", "MicroSaunaSens"];

function SaunaTypeStep({
  onSelect,
}: {
  onSelect: (type: "harvia" | "manual" | "none") => void;
}) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div
        onClick={() => onSelect("harvia")}
        className="cursor-pointer rounded-lg border border-[#D01400] bg-[#D01400] p-4 text-white transition-colors hover:bg-[#FF7A28]"
      >
        <h3 className="text-left font-bold">Add a Harvia Smart Sauna</h3>
        <p className="text-sm">
          Unlock automatic tracking of your sauna sessions, including detailed
          temperature and humidity data.
        </p>
      </div>
      <div
        onClick={() => onSelect("manual")}
        className="cursor-pointer rounded-lg border border-[#2C2B36] bg-[#1F1F23] p-4 transition-colors hover:bg-white/10"
      >
        <h3 className="text-left font-bold text-white">Add Any Sauna</h3>
        <p className="text-sm text-gray-400">
          Manually log your sessions and host sauna events.
        </p>
      </div>
      <div
        onClick={() => onSelect("none")}
        className="cursor-pointer rounded-lg p-4 text-center transition-colors hover:bg-white/10"
      >
        <h3 className="text-left font-bold text-white">
          Continue Without a Sauna
        </h3>
        <p className="text-left text-sm text-gray-400">
          Join friends' sauna events and participate in the community.
        </p>
      </div>
    </div>
  );
}

function CreateSaunaStep({
  onNext,
  onSkip,
}: {
  onNext: (id: string) => void;
  onSkip: () => void;
}) {
  const [name, setName] = useState("");
  const createSauna = api.sauna.createSauna.useMutation({
    onSuccess: (data) => {
      onNext(data.id);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSauna.mutate({ name, location: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <input
        type="text"
        placeholder="Mökkisauna"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-[#2C2B36] bg-[#1F1F23] p-4 text-white focus:border-blue-500 focus:ring-blue-500"
        required
      />
      <button
        type="submit"
        className="cursor-pointer rounded-lg bg-[#D01400] p-4 font-bold text-white transition-colors hover:bg-[#FF7A28]"
        disabled={createSauna.isPending}
      >
        {createSauna.isPending ? "Creating..." : "Continue"}
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="cursor-pointer rounded-lg bg-transparent p-4 font-bold text-gray-400 transition-colors hover:bg-white/10"
      >
        Continue without own sauna
      </button>
    </form>
  );
}

function HarviaStep({ onNext }: { onNext: () => void }) {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const linkHarvia = api.user.linkHarviaAccount.useMutation({
    onSuccess: () => {
      setShowLogin(false);
    },
  });
  const { data: demoDevices } = api.sauna.getDemoSaunas.useQuery();
  const { data: devices } = api.sauna.discoverDevices.useQuery(undefined, {
    enabled: linkHarvia.isSuccess,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    linkHarvia.mutate({ username, password });
  };

  const createSauna = api.sauna.createSauna.useMutation({
    onSuccess: () => {
      onNext();
    },
  });

  const handleDeviceSelection = () => {
    const device =
      devices?.find((d) => d.id === selectedDevice) ||
      demoDevices?.find((d) => d.id === selectedDevice);
    if (device) {
      createSauna.mutate({
        name: device.name,
        location: "",
        harviaDeviceId: device.id,
      });
    }
  };

  if (showLogin) {
    return (
      <form
        onSubmit={handleLogin}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <input
          type="text"
          placeholder="Harvia username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-lg border border-[#2C2B36] bg-[#1F1F23] p-4 text-white focus:border-blue-500 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Harvia password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-[#2C2B36] bg-[#1F1F23] p-4 text-white focus:border-blue-500 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-[#D01400] p-4 font-bold text-white transition-colors hover:bg-[#FF7A28]"
          disabled={linkHarvia.isPending}
        >
          {linkHarvia.isPending ? "Logging in..." : "Login to Harvia"}
        </button>
      </form>
    );
  }

  const filteredDemoDevices = demoDevices?.filter(
    (dev) =>
      dev.type === "SaunaSensor" && !deviceNameBlacklist.includes(dev.name),
  );

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <span>Select a Harvia sauna</span>
      <div className="flex max-h-64 w-full flex-col gap-2 overflow-y-auto">
        {devices && <span>My saunas</span>}
        {devices?.map((device) => (
          <div
            key={device.id}
            onClick={() => setSelectedDevice(device.id)}
            className={`cursor-pointer rounded-lg p-4 transition-colors duration-100 ${
              selectedDevice === device.id ? "bg-gray-700" : "bg-gray-900"
            }`}
          >
            {device.name}
          </div>
        ))}
        <span>Junction DEMO saunas</span>

        {filteredDemoDevices?.map((device) => (
          <div
            key={device.id}
            onClick={() => setSelectedDevice(device.id)}
            className={`cursor-pointer rounded-lg p-4 transition-colors duration-100 ${
              selectedDevice === device.id ? "bg-gray-700" : "bg-gray-900"
            }`}
          >
            {device.name}
          </div>
        ))}
      </div>
      <button
        onClick={handleDeviceSelection}
        className="cursor-pointer rounded-lg bg-[#D01400] p-4 font-bold text-white transition-colors hover:bg-[#FF7A28]"
        disabled={!selectedDevice}
      >
        Add Sauna
      </button>
      <button
        onClick={() => setShowLogin(true)}
        className="cursor-pointer rounded-lg bg-transparent p-4 font-bold text-gray-400 transition-colors hover:bg-white/10"
      >
        Login with Harvia to add own saunas
      </button>
    </div>
  );
}

function SaunaSetupContent() {
  const [step, setStep] = useState(1);
  const [saunaId, setSaunaId] = useState<string | null>(null);
  const [saunaType, setSaunaType] = useState<
    "harvia" | "manual" | "none" | null
  >(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "harvia") {
      setSaunaType("harvia");
      setStep(2);
    }
  }, [searchParams]);

  const handleSaunaTypeSelect = (type: "harvia" | "manual" | "none") => {
    setSaunaType(type);
    if (type === "none") {
      router.push("/");
    } else {
      setStep(2);
    }
  };

  return (
    <div className="container flex max-w-md flex-col items-center justify-center gap-8 px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">Add your sauna</h1>
      <p className="text-center text-lg text-gray-400">
        Adding your sauna allows you to track sessions, host events, and share
        your experiences with the community.
      </p>
      {step === 1 && <SaunaTypeStep onSelect={handleSaunaTypeSelect} />}
      {step === 2 && saunaType === "manual" && (
        <CreateSaunaStep
          onNext={(id) => {
            setSaunaId(id);
            router.push("/");
          }}
          onSkip={() => router.push("/")}
        />
      )}
      {step === 2 && saunaType === "harvia" && (
        <HarviaStep onNext={() => router.push("/")} />
      )}
    </div>
  );
}

export default function SaunaSetupPage() {
  return (
    <main className="flex flex-col items-center justify-center bg-black text-white">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center text-white">
            Loading...
          </div>
        }
      >
        <SaunaSetupContent />
      </Suspense>
    </main>
  );
}
