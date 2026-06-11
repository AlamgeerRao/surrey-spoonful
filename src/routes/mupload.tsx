import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ADMIN_PASSWORD = "zaiqa123"; // ✅ change later

function AdminPage() {
  const [input, setInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (input === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-display">Admin Access</h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="Enter password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded border p-3"
          />

          <button
            type="submit"
            className="w-full rounded bg-primary px-4 py-3 text-white"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-display">Menu Admin</h1>

      <p className="mt-4 text-muted-foreground">
        Upload a new menu file here.
      </p>

      {/* ✅ Next phase will go here */}
      <div className="mt-6 rounded-xl border p-6">
        <p className="text-sm">Excel upload coming next…</p>
      </div>
    </div>
  );
}
