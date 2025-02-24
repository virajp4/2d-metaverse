import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function Home() {
  const [spaceId, setSpaceId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const handleJoinSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (spaceId.trim()) {
      navigate(`/arena/${spaceId}`);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/space`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: "New Space" }),
      });

      if (!response.ok) throw new Error("Failed to create space");

      const data = await response.json();
      navigate(`/arena/${data.spaceId}`);
    } catch (err) {
      setError("Failed to create space");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Metaverse Space</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Join Existing Space</h2>
            <form onSubmit={handleJoinSpace}>
              <input
                type="text"
                placeholder="Enter Space ID"
                value={spaceId}
                onChange={(e) => setSpaceId(e.target.value)}
                className="w-full p-2 border rounded mb-3"
              />
              <button
                type="submit"
                disabled={!spaceId.trim()}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                Join Space
              </button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Create New Space</h2>
            <button
              onClick={handleCreateSpace}
              disabled={creating}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {creating ? "Creating..." : "Create New Space"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
