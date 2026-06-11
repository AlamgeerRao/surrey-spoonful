import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import existingMenu from "@/data/menu.json";

export const Route = createFileRoute("/admin/mupload")({
  component: AdminPage,
});

const ADMIN_PASSWORD = "zaiqa123";

type MenuSize = {
  id: string;
  label: string;
  pricePence: number;
};

type MenuItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  spice: 0 | 1 | 2 | 3;
  allergens: string[];
  halal: boolean;
  popular: boolean;
  weeklySpecial: boolean;
  image: string;
  available: string[];
  slots?: string[];
  sizes: MenuSize[];
};

function toBool(value: unknown) {
  if (typeof value === "boolean") return value;
  const text = String(value ?? "").trim().toLowerCase();
  return text === "true" || text === "yes" || text === "1";
}

function toStringSafe(value: unknown) {
  return String(value ?? "").trim();
}

function toStringArray(value: unknown) {
  const text = toStringSafe(value);
  if (!text) return [];
  return text
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

function toSpice(value: unknown): 0 | 1 | 2 | 3 {
  const n = Number(value);
  if (n === 1 || n === 2 || n === 3) return n;
  return 0;
}

function buildSizesFromRow(row: Record<string, unknown>): MenuSize[] {
  const sizes: MenuSize[] = [];

  const mapping = [
    {
      id: toStringSafe(row.size1_id),
      label: toStringSafe(row.size1_label),
      pricePence: Number(row.size1_pricePence),
    },
    {
      id: toStringSafe(row.size2_id),
      label: toStringSafe(row.size2_label),
      pricePence: Number(row.size2_pricePence),
    },
    {
      id: toStringSafe(row.size3_id),
      label: toStringSafe(row.size3_label),
      pricePence: Number(row.size3_pricePence),
    },
  ];

  for (const s of mapping) {
    if (s.id && s.label && Number.isFinite(s.pricePence) && s.pricePence > 0) {
      sizes.push({
        id: s.id,
        label: s.label,
        pricePence: s.pricePence,
      });
    }
  }

  return sizes;
}

function transformRowToMenuItem(row: Record<string, unknown>): MenuItem | null {
  const id = toStringSafe(row.id);
  if (!id) return null;

  const slug = toStringSafe(row.slug) || id;
  const sizes = buildSizesFromRow(row);

  return {
    id,
    slug,
    name: toStringSafe(row.name),
    category: toStringSafe(row.category),
    description: toStringSafe(row.description),
    longDescription: toStringSafe(row.longDescription) || "",
    spice: toSpice(row.spice),
    allergens: toStringArray(row.allergens).map(
      (x) => x.charAt(0).toUpperCase() + x.slice(1)
    ),
    halal: true, // always true as discussed
    popular: toBool(row.popular),
    weeklySpecial: toBool(row.weeklySpecial),
    image: `/assets/food/${id}.jpg`,
    available: toStringArray(row.available),
    slots: toStringArray(row.slots),
    sizes,
  };
}

function mergeMenu(existing: any[], incoming: any[]) {
  const map = new Map<string, any>();

  // existing first
  for (const item of existing) {
    map.set(item.id, item);
  }

  // incoming overwrites by id
  for (const item of incoming) {
    map.set(item.id, item);
  }

  return Array.from(map.values());
}

function AdminPage() {
  const [input, setInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [fileName, setFileName] = useState("");

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

      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      setRawRows(json);
      setFileName(file.name);
    };

    reader.readAsBinaryString(file);
  }

  const transformedRows = useMemo(() => {
    return rawRows
      .map(transformRowToMenuItem)
      .filter((x): x is MenuItem => x !== null);
  }, [rawRows]);

  const mergedMenu = useMemo(() => {
    if (transformedRows.length === 0) return [];

    return mergeMenu(existingMenu as any[], transformedRows);
  }, [transformedRows]);

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-display">Menu Admin</h1>

      <p className="mt-4 text-muted-foreground">
        Upload an Excel file to preview transformed menu data and merged
        <code className="ml-1 rounded bg-muted px-1 py-0.5">menu.json</code>.
      </p>

      <div className="mt-6 space-y-6">
        {/* Upload box */}
        <div className="rounded-xl border border-border p-6">
          <label className="block text-sm font-medium text-foreground">
            Upload Excel (.xlsx)
          </label>

          <input
            type="file"
            accept=".xlsx"
            className="mt-3"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <div className="mt-4 text-xs text-muted-foreground">
            Images are assumed from:
            <code className="ml-1 rounded bg-muted px-1 py-0.5">
              /assets/food/id.jpg
            </code>
          </div>
        </div>

        {/* Raw Excel preview */}
        {rawRows.length > 0 && (
          <div className="rounded-xl border border-border p-6">
            <h2 className="mb-4 text-lg font-medium">
              Excel preview ({rawRows.length} rows)
            </h2>

            {fileName && (
              <p className="mb-3 text-xs text-muted-foreground">
                File: <strong>{fileName}</strong>
              </p>
            )}

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
                          className="border px-2 py-1 align-top"
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

{/* Transformed JSON preview */}
{transformedRows.length > 0 && (
  <div className="rounded-xl border border-border p-6">
    <h2 className="text-lg font-medium">
      Transformed menu preview
    </h2>

    <p className="mt-2 text-sm text-muted-foreground">
      New items are highlighted in green. Existing items that will be overwritten by the same <strong>id</strong> are highlighted in amber.
    </p>

    <div className="mt-4 space-y-4">
      {transformedRows.map((item) => {
        const exists = (existingMenu as any[]).some((m) => m.id === item.id);

        return (
          <div
            key={item.id}
            className={`rounded-xl border p-4 ${
              exists
                ? "border-amber-300 bg-amber-50"
                : "border-emerald-300 bg-emerald-50"
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-foreground">
                  {item.name} ({item.id})
                </div>
                <div className="text-xs text-muted-foreground">
                  {exists
                    ? "This item already exists in menu.json and will be updated"
                    : "This is a new item and will be added"}
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  exists
                    ? "bg-amber-200 text-amber-900"
                    : "bg-emerald-200 text-emerald-900"
                }`}
              >
                {exists ? "Updated" : "New"}
              </span>
            </div>

            <div className="max-h-80 overflow-auto rounded border bg-white/70 p-3">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

        {/* Final merged output */}
        {mergedMenu.length > 0 && (
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-lg font-medium">
              Final merged menu.json preview
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Existing items are updated by <strong>id</strong>. New items are
              added.
            </p>

            <div className="mt-4 max-h-[36rem] overflow-auto rounded border bg-muted/20 p-4">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(mergedMenu, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
