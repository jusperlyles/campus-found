import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { format, subDays } from "date-fns";
import { CalendarIcon, Camera, ImageIcon, Mic, Square, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CATEGORIES, LOCATIONS, PHONE_RE, type Kind } from "@/lib/items";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an item — FoundIt" },
      { name: "description", content: "Report a lost or found item on campus in under a minute." },
      { property: "og:title", content: "Report an item — FoundIt" },
      { property: "og:description", content: "Report a lost or found item on campus in under a minute." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Report,
});

async function upload(file: Blob, ext: string) {
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("item-media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("item-media").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (e2) throw e2;
  return data.signedUrl;
}

function Report() {
  const nav = useNavigate();
  const [kind, setKind] = useState<Kind>("lost");
  const [category, setCategory] = useState("wallet");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const libRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const toggleRec = async () => {
    if (recording) { recRef.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        setAudio(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microphone access was blocked");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !date) { toast.error("Please fill in all required fields"); return; }
    if (!PHONE_RE.test(phone)) { toast.error("Phone must be 10 digits, e.g. 0779123456"); return; }
    setBusy(true);
    try {
      const photo_url = photo ? await upload(photo, photo.name.split(".").pop() || "jpg") : null;
      const audio_url = audio ? await upload(audio, audio.type.includes("mp4") ? "m4a" : "webm") : null;
      const { error } = await supabase.from("items").insert({
        kind, category, name: name.trim(), location: location.trim(),
        item_date: format(date, "yyyy-MM-dd"), description: description.trim() || null,
        phone, photo_url, audio_url,
      });
      if (error) throw error;
      toast.success("Posted! Everyone on campus has been notified.");
      nav({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  };

  const label = "mb-2 block text-sm font-semibold";
  const field = "w-full rounded-xl border bg-card px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <AppShell>
      <form onSubmit={submit} className="space-y-6 px-5">
        <div>
          <h1 className="text-3xl font-extrabold">Report property</h1>
          <p className="text-sm text-muted-foreground">Takes less than a minute.</p>
        </div>

        <div className="grid grid-cols-2 rounded-2xl bg-secondary p-1">
          {(["lost", "found"] as Kind[]).map((k) => (
            <button type="button" key={k} onClick={() => setKind(k)}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${kind === k ? (k === "lost" ? "bg-lost text-lost-foreground" : "bg-found text-found-foreground") : "text-muted-foreground"}`}>
              I {k} something
            </button>
          ))}
        </div>

        <div>
          <span className={label}>Photo of the item</span>
          <input ref={libRef} type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
          <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
          {photo ? (
            <div className="relative">
              <img src={URL.createObjectURL(photo)} alt="Preview" className="aspect-[4/3] w-full rounded-xl object-cover" />
              <button type="button" onClick={() => setPhoto(null)} aria-label="Remove photo" className="absolute right-2 top-2 rounded-full bg-card p-1.5"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => libRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border border-dashed bg-card py-10 text-sm font-medium"><ImageIcon className="h-5 w-5" /> From library</button>
              <button type="button" onClick={() => camRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border border-dashed bg-card py-10 text-sm font-medium"><Camera className="h-5 w-5" /> Take photo</button>
            </div>
          )}
        </div>

        <div>
          <span className={label}>Category</span>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(({ value, label: l, icon: Icon }) => (
              <button type="button" key={value} onClick={() => setCategory(value)}
                className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-semibold transition ${category === value ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>
                <Icon className="h-5 w-5" /> {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label} htmlFor="name">Item name *</label>
          <input id="name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="Brown leather wallet" className={field} />
        </div>

        <div>
          <label className={label} htmlFor="loc">Location / hostel area *</label>
          <input id="loc" required list="locs" maxLength={160} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Pick or type a place" className={field} />
          <datalist id="locs">{LOCATIONS.map((l) => <option key={l} value={l} />)}</datalist>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LOCATIONS.slice(0, 4).map((l) => (
              <button type="button" key={l} onClick={() => setLocation(l)} className="rounded-full bg-secondary px-3 py-1 text-xs">{l}</button>
            ))}
          </div>
        </div>

        <div>
          <span className={label}>Date *</span>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={`${field} flex items-center gap-2 text-left`}>
                <CalendarIcon className="h-4 w-4" /> {date ? format(date, "EEEE, d MMMM yyyy") : "Pick a date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate}
                disabled={(d) => d > new Date() || d < subDays(new Date(), 90)} />
            </PopoverContent>
          </Popover>
          <p className="mt-1 text-xs text-muted-foreground">Within the last 90 days.</p>
        </div>

        <div>
          <label className={label} htmlFor="desc">Description</label>
          <textarea id="desc" rows={3} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Distinguishing features, stickers, colour…" className={field} />
        </div>

        <div>
          <span className={label}>Voice description</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleRec}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${recording ? "animate-pulse bg-destructive text-destructive-foreground" : "bg-secondary"}`}>
              {recording ? <><Square className="h-4 w-4" /> Stop</> : <><Mic className="h-4 w-4" /> {audio ? "Re-record" : "Record"}</>}
            </button>
            {audio && !recording && (
              <>
                <audio controls src={URL.createObjectURL(audio)} className="h-9 flex-1" />
                <button type="button" aria-label="Remove recording" onClick={() => setAudio(null)}><X className="h-4 w-4" /></button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className={label} htmlFor="phone">Contact phone *</label>
          <input id="phone" required inputMode="numeric" maxLength={10} value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="0779XXXXXX" className={`${field} tracking-wider`} />
        </div>

        <button disabled={busy} className="w-full rounded-2xl bg-accent py-4 font-display text-lg font-bold text-accent-foreground disabled:opacity-60">
          {busy ? "Submitting…" : "Submit report"}
        </button>
      </form>
    </AppShell>
  );
}
