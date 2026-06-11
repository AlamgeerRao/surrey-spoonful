function AdminPage() {
  const [token, setToken] = useState("");
  const [input, setInput] = useState(""); // ✅ separate login input
  const [authenticated, setAuthenticated] = useState(false);

  const [date, setDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<SlotDoc[]>([]);
  const [dateClosed, setDateClosed] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Load saved token
  useEffect(() => {
    const t = sessionStorage.getItem("hpk.adminToken");
    if (t) {
      setToken(t);
      setAuthenticated(true);
    }
  }, []);

  // ✅ Save token
  useEffect(() => {
    if (token) {
      sessionStorage.setItem("hpk.adminToken", token);
    }
  }, [token]);

  // ✅ LOGIN HANDLER
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!input) {
      toast.error("Enter admin token");
      return;
    }

    setToken(input);
    setAuthenticated(true);
  }

  const load = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const r = await fetch(`${BASE}/slots?date=${ymd(date)}`);
      if (r.ok) {
        const data = await r.json();
        setSlots(data.slots);
        setDateClosed(data.closed);
      } else {
        toast.error("Failed to load");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [date, token]); // ✅ include token here

  const override = async (opts: {
    slot?: DeliverySlotId;
    closed: boolean;
  }) => {
    const r = await fetch(`${BASE}/admin/override`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify({ date: ymd(date), ...opts }),
    });

    if (r.ok) {
      toast.success("Saved");
      load();
    } else {
      toast.error("Failed (check admin token)");
    }
  };

  // ✅ 🔴 LOGIN SCREEN
  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-3xl font-display">Admin Access</h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <Input
            type="password"
            placeholder="Enter admin token"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
    );
  }

  // ✅ ✅ MAIN ADMIN UI (unchanged)
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-foreground">
        Admin · Slot management
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        View today's occupancy and close slots or whole dates when you can't take
        orders.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <Label className="text-sm">Admin token</Label>
        <Input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="mt-1.5"
        />

        <div className="mt-5">
          <Label className="text-sm">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="mt-1.5 w-full justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "EEE, d MMM yyyy")}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="p-3"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">
            Slots — {format(date, "EEE, d MMM")}
          </h2>

          <Button
            variant={dateClosed ? "default" : "outline"}
            size="sm"
            onClick={() => override({ closed: !dateClosed })}
          >
            {dateClosed ? (
              <>
                <Unlock className="mr-1 h-4 w-4" />
                Reopen day
              </>
            ) : (
              <>
                <X className="mr-1 h-4 w-4" />
                Close whole day
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {DELIVERY_SLOTS.map((def) => {
              const s = slots.find((x) => x.slot === def.id);
              const used = s?.used ?? 0;
              const closed = s?.closedByAdmin || dateClosed;
              const full = used >= MAX_ORDERS_PER_SLOT;

              return (
                <li
                  key={def.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {def.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {used} / {MAX_ORDERS_PER_SLOT} orders
                      {full && " · FULL"} {closed && " · CLOSED"}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={s?.closedByAdmin ? "default" : "outline"}
                    onClick={() =>
                      override({ slot: def.id, closed: !s?.closedByAdmin })
                    }
                  >
                    {s?.closedByAdmin ? (
                      <>
                        <Unlock className="mr-1 h-4 w-4" />
                        Reopen
                      </>
                    ) : (
                      <>
                        <Lock className="mr-1 h-4 w-4" />
                        Close
                      </>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
