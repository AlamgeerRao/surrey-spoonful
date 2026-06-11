import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ADMIN_PASSWORD = "zaiqa123";

function AdminPage() {
  const [input, setInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [rawRows, setRawRows] = useState<any[]>([]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (input === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  }

  function handleFile(file: File) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet);
      setRawRows(json);
    };

    reader.readAsBinaryString(file);
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

      <div className="mt-6 space-y-6">

        {/* ✅ Upload box */}
        <div className="rounded-xl border border-border p-6">
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {/* ✅ Preview */}
        {rawRows.length > 0 && (
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-lg font-medium mb-4">
              Preview ({rawRows.length} rows)
            </h2>

            <div className="max-h-96 overflow-auto text-sm">
              <table className="w-full border">
                <thead>
                  <tr>
                    {Object.keys(rawRows[0]).map((key) => (
                      <th
                        key={key}
                        className="border px-2 py-1 text-left"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rawRows.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val: any, j) => (
                        <td
                          key={j}
                          className="border px-2 py-1"
                        >
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
