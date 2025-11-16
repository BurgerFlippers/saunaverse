"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function SaunaList() {
  const [saunas] = api.sauna.getSaunas.useSuspenseQuery();
  const { data: discoveredDevices, refetch: discoverDevices } =
    api.sauna.discoverDevices.useQuery(undefined, { enabled: true });
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const createSauna = api.sauna.createSauna.useMutation({
    onSuccess: async () => {
      await utils.sauna.invalidate();
      setName("");
      setLocation("");
      setSelectedDevice(null);
    },
  });

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        {discoveredDevices && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Add sauna</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedDevice) {
                  createSauna.mutate({
                    name,
                    location,
                    harviaDeviceId: selectedDevice,
                  });
                }
              }}
              className="mb-8 flex flex-col gap-2"
            >
              <input
                type="text"
                placeholder="Sauna Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
              />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
              />
              <div className="flex flex-col gap-2">
                <p>Select sensor</p>
                {discoveredDevices.map((device) => (
                  <div
                    key={device.id}
                    className={`cursor-pointer rounded-lg p-4 ${
                      selectedDevice === device.id
                        ? "bg-blue-500/50"
                        : "bg-white/10"
                    }`}
                    onClick={() => setSelectedDevice(device.id)}
                  >
                    <p className="text-lg font-semibold">{device.name}</p>
                    <p className="text-sm text-gray-400">{device.type}</p>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
                disabled={createSauna.isPending || !selectedDevice}
              >
                {createSauna.isPending ? "Adding..." : "Add Sauna"}
              </button>
            </form>
          </div>
        )}
      </div>

      {saunas.length > 0 ? (
        <div className="flex flex-col gap-4">
          {saunas.map((sauna) => (
            <div key={sauna.id} className="rounded-lg bg-white/10 p-4">
              <a href={`/saunas/${sauna.id}/history`}>
                <p className="text-lg font-semibold">{sauna.name}</p>
                <p className="text-sm text-gray-400">{sauna.location}</p>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p>You have no saunas yet.</p>
      )}
    </div>
  );
}
