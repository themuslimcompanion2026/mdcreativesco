import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui-premium/GlassCard";
import { useBookingSettings, usePricingPlans, usePricingSettings, useSocialLinks, useSiteSetting, usePortfolioItems, useAllStatsItems } from "@/hooks/useSiteData";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Save, Plus, Trash2, Image as ImageIcon, Star, BarChart3, Receipt, TrendingUp, QrCode, Download, ExternalLink, Twitter, Instagram, Linkedin, Github, Facebook, MessageCircle, Send as SendIcon } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createInvoice, markInvoicePaid, updateInvoiceStatus, deleteInvoice, previewFxRate } from "@/lib/payments.functions";
import { useInvoices, useQrCodes } from "@/hooks/usePayments";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — MD Creatives" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"site" | "social" | "pricing" | "booking" | "portfolio" | "stats" | "payments" | "revenue">("site");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <GlassCard className="max-w-md p-8 text-center">
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This account doesn't have admin privileges. If this is unexpected, sign in with your admin email.
          </p>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </GlassCard>
      </div>
    );
  }

  const tabs = [
    { id: "site", label: "Site & Logo" },
    { id: "social", label: "Social & Contact" },
    { id: "pricing", label: "Pricing" },
    { id: "booking", label: "Booking" },
    { id: "portfolio", label: "Portfolio" },
    { id: "stats", label: "Stats / Metrics" },
    { id: "payments", label: "Payments & Finance" },
    { id: "revenue", label: "Revenue & Analytics" },
  ] as const;

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin</div>
            <h1 className="mt-1 text-3xl font-bold text-gradient">Studio Control</h1>
          </div>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-1 rounded-full glass p-1.5 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                tab === t.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "site" && <SiteTab />}
          {tab === "social" && <SocialTab />}
          {tab === "pricing" && <PricingTab />}
          {tab === "booking" && <BookingTab />}
          {tab === "portfolio" && <PortfolioTab />}
          {tab === "stats" && <StatsTab />}
          {tab === "payments" && <PaymentsTab />}
          {tab === "revenue" && <RevenueTab />}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

function input(extra = "") {
  return `w-full rounded-xl glass px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground ${extra}`;
}

function SaveBtn({ onClick, label = "Save Changes" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
      style={{ background: "var(--gradient-primary)" }}
    >
      <Save className="h-4 w-4" /> {label}
    </button>
  );
}

function SiteTab() {
  const { data: brand } = useSiteSetting("brand");
  const { data: contact } = useSiteSetting("contact");
  const qc = useQueryClient();
  const [logoUrl, setLogoUrl] = useState("");
  const [redirect, setRedirect] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setLogoUrl(brand?.logo_url ?? "");
    setRedirect(brand?.logo_redirect_url ?? "/");
  }, [brand]);
  useEffect(() => {
    setEmail(contact?.email ?? "");
    setPhone(contact?.phone ?? "");
  }, [contact]);

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const save = async () => {
    await supabase.from("site_settings").upsert({ key: "brand", value: { name: "MD Creatives", logo_url: logoUrl, logo_redirect_url: redirect } });
    await supabase.from("site_settings").upsert({ key: "contact", value: { email, phone } });
    qc.invalidateQueries();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold">Logo</h3>
        <div className="mt-4 space-y-4">
          {logoUrl && (
            <div className="grid h-32 place-items-center rounded-xl bg-white/5">
              <img src={logoUrl} alt="Logo" className="max-h-24 max-w-[80%]" />
            </div>
          )}
          <Field label="Upload new logo">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              className={input("file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs")}
            />
            {uploading && <p className="mt-1 text-xs text-muted-foreground">Uploading...</p>}
          </Field>
          <Field label="Or paste URL">
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={input()} placeholder="https://..." />
          </Field>
          <Field label="Logo click redirect URL">
            <input value={redirect} onChange={(e) => setRedirect(e.target.value)} className={input()} placeholder="/" />
          </Field>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-bold">Contact</h3>
        <div className="mt-4 space-y-4">
          <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} className={input()} /></Field>
          <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={input()} placeholder="+1 555..." /></Field>
        </div>
      </GlassCard>

      <div className="md:col-span-2"><SaveBtn onClick={save} /></div>
    </div>
  );
}

function SocialTab() {
  const { data: links = [] } = useSocialLinks();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    const d: Record<string, string> = {};
    links.forEach((l) => (d[l.id] = l.url));
    setDraft(d);
  }, [links]);

  const save = async () => {
    await Promise.all(
      links.map((l) =>
        supabase.from("social_links").update({ url: draft[l.id] ?? "" }).eq("id", l.id)
      )
    );
    qc.invalidateQueries({ queryKey: ["social_links"] });
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold">Social Links</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Empty URLs will be hidden from the site automatically.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <Field key={l.id} label={l.platform}>
            <input
              value={draft[l.id] ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, [l.id]: e.target.value }))}
              placeholder={l.platform === "whatsapp" ? "+1234567890" : "https://..."}
              className={input()}
            />
          </Field>
        ))}
      </div>
      <div className="mt-6"><SaveBtn onClick={save} /></div>
    </GlassCard>
  );
}

function PricingTab() {
  const { data: plans = [] } = usePricingPlans();
  const { data: settings } = usePricingSettings();
  const qc = useQueryClient();
  const [visible, setVisible] = useState(true);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");

  useEffect(() => {
    if (settings) {
      setVisible(settings.visible);
      setHeading(settings.heading);
      setSubheading(settings.subheading);
    }
  }, [settings]);

  const saveSettings = async () => {
    await supabase.from("pricing_settings").update({ visible, heading, subheading }).eq("id", 1);
    qc.invalidateQueries({ queryKey: ["pricing_settings"] });
  };

  const addPlan = async () => {
    await supabase.from("pricing_plans").insert({
      name: "New Plan", price: 0, features: [], sort_order: plans.length + 1,
    });
    qc.invalidateQueries({ queryKey: ["pricing_plans"] });
  };

  const updatePlan = async (id: string, patch: any) => {
    await supabase.from("pricing_plans").update(patch).eq("id", id);
    qc.invalidateQueries({ queryKey: ["pricing_plans"] });
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await supabase.from("pricing_plans").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["pricing_plans"] });
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Section Settings</h3>
          <label className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Show pricing to visitors</span>
            <button
              onClick={() => setVisible((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${visible ? "bg-primary" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${visible ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </label>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Heading"><input value={heading} onChange={(e) => setHeading(e.target.value)} className={input()} /></Field>
          <Field label="Subheading"><input value={subheading} onChange={(e) => setSubheading(e.target.value)} className={input()} /></Field>
        </div>
        <div className="mt-5"><SaveBtn onClick={saveSettings} /></div>
      </GlassCard>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Plans</h3>
        <button onClick={addPlan} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
          <Plus className="h-3.5 w-3.5" /> Add plan
        </button>
      </div>

      <div className="space-y-4">
        {plans.map((p) => <PlanEditor key={p.id} plan={p} onSave={updatePlan} onDelete={deletePlan} />)}
      </div>
    </div>
  );
}

function PlanEditor({ plan, onSave, onDelete }: { plan: any; onSave: (id: string, patch: any) => void; onDelete: (id: string) => void }) {
  const [d, setD] = useState({ ...plan, features: (plan.features as string[]).join("\n") });
  return (
    <GlassCard className="p-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Name"><input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className={input()} /></Field>
        <Field label="Badge (optional)"><input value={d.badge ?? ""} onChange={(e) => setD({ ...d, badge: e.target.value })} className={input()} placeholder="Most Popular" /></Field>
        <Field label="Description"><input value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} className={input()} /></Field>
        <Field label="Sort order"><input type="number" value={d.sort_order} onChange={(e) => setD({ ...d, sort_order: +e.target.value })} className={input()} /></Field>
        <Field label="Price"><input type="number" value={d.price} onChange={(e) => setD({ ...d, price: +e.target.value })} className={input()} /></Field>
        <Field label="Currency">
          <select value={d.currency} onChange={(e) => setD({ ...d, currency: e.target.value })} className={input()}>
            {["USD","EUR","GBP","AED","SAR","PHP"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Billing label"><input value={d.billing_label} onChange={(e) => setD({ ...d, billing_label: e.target.value })} className={input()} placeholder="one-time / monthly" /></Field>
        <Field label="CTA label"><input value={d.cta_label} onChange={(e) => setD({ ...d, cta_label: e.target.value })} className={input()} /></Field>
        <Field label="CTA URL"><input value={d.cta_url} onChange={(e) => setD({ ...d, cta_url: e.target.value })} className={input()} /></Field>
        <Field label="Note (optional)"><input value={d.note ?? ""} onChange={(e) => setD({ ...d, note: e.target.value })} className={input()} /></Field>

        <div className="md:col-span-2 mt-2 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Maintenance (optional)</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Monthly maintenance price"><input type="number" value={d.monthly_maintenance_price ?? ""} onChange={(e) => setD({ ...d, monthly_maintenance_price: e.target.value === "" ? null : +e.target.value })} className={input()} placeholder="e.g. 50" /></Field>
            <Field label="Monthly maintenance currency">
              <select value={d.monthly_maintenance_currency ?? ""} onChange={(e) => setD({ ...d, monthly_maintenance_currency: e.target.value || null })} className={input()}>
                <option value="">— same as plan —</option>
                {["USD","EUR","GBP","AED","SAR","PHP"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Yearly maintenance price"><input type="number" value={d.yearly_maintenance_price ?? ""} onChange={(e) => setD({ ...d, yearly_maintenance_price: e.target.value === "" ? null : +e.target.value })} className={input()} placeholder="e.g. 50000" /></Field>
            <Field label="Yearly maintenance currency">
              <select value={d.yearly_maintenance_currency ?? ""} onChange={(e) => setD({ ...d, yearly_maintenance_currency: e.target.value || null })} className={input()}>
                <option value="">— same as plan —</option>
                {["USD","EUR","GBP","AED","SAR","PHP"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Monthly maintenance description (optional, one per line for bullets)">
                <textarea
                  rows={4}
                  value={d.monthly_maintenance_description ?? ""}
                  onChange={(e) => setD({ ...d, monthly_maintenance_description: e.target.value || null })}
                  className={input("resize-none")}
                  placeholder={"Website updates\nBug fixes\nSecurity monitoring\nPriority support"}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Yearly maintenance description (optional, one per line for bullets)">
                <textarea
                  rows={4}
                  value={d.yearly_maintenance_description ?? ""}
                  onChange={(e) => setD({ ...d, yearly_maintenance_description: e.target.value || null })}
                  className={input("resize-none")}
                  placeholder={"Dedicated long-term support\nPriority maintenance\nMonthly optimizations\nBusiness growth partnership"}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Field label="Features (one per line)">
            <textarea
              rows={5}
              value={d.features}
              onChange={(e) => setD({ ...d, features: e.target.value })}
              className={input("resize-none")}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={d.featured} onChange={(e) => setD({ ...d, featured: e.target.checked })} />
          <Star className="h-3.5 w-3.5 text-primary" /> Featured plan
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={d.show_price !== false} onChange={(e) => setD({ ...d, show_price: e.target.checked })} />
          Show price publicly
        </label>

        {d.show_price === false && (
          <>
            <Field label="Hidden-price CTA label"><input value={d.hidden_price_cta_label ?? ""} onChange={(e) => setD({ ...d, hidden_price_cta_label: e.target.value })} className={input()} placeholder="Get Custom Quote" /></Field>
            <Field label="Hidden-price CTA URL"><input value={d.hidden_price_cta_url ?? ""} onChange={(e) => setD({ ...d, hidden_price_cta_url: e.target.value })} className={input()} placeholder="/book" /></Field>
          </>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <button onClick={() => onDelete(plan.id)} className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive hover:bg-destructive/20">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
        <SaveBtn
          label="Save plan"
          onClick={() => onSave(plan.id, { ...d, features: d.features.split("\n").map((s: string) => s.trim()).filter(Boolean) })}
        />
      </div>
    </GlassCard>
  );
}

function BookingTab() {
  const { data: s } = useBookingSettings();
  const qc = useQueryClient();
  const [d, setD] = useState<any>({});
  useEffect(() => { if (s) setD(s); }, [s]);

  const save = async () => {
    await supabase.from("booking_settings").update(d).eq("id", 1);
    qc.invalidateQueries({ queryKey: ["booking_settings"] });
  };

  if (!d.id) return null;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Booking Page</h3>
        <label className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Enabled</span>
          <button
            onClick={() => setD({ ...d, enabled: !d.enabled })}
            className={`relative h-6 w-11 rounded-full transition-colors ${d.enabled ? "bg-primary" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${d.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </label>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Field label="Heading"><input value={d.heading ?? ""} onChange={(e) => setD({ ...d, heading: e.target.value })} className={input()} /></Field>
        <Field label="Subheading"><input value={d.subheading ?? ""} onChange={(e) => setD({ ...d, subheading: e.target.value })} className={input()} /></Field>
        <Field label="WhatsApp number (digits only)"><input value={d.whatsapp_number ?? ""} onChange={(e) => setD({ ...d, whatsapp_number: e.target.value })} className={input()} placeholder="+1234567890" /></Field>
        <Field label="Telegram URL"><input value={d.telegram_url ?? ""} onChange={(e) => setD({ ...d, telegram_url: e.target.value })} className={input()} placeholder="https://t.me/yourhandle" /></Field>
        <Field label="Calendly / scheduling embed URL"><input value={d.calendly_url ?? ""} onChange={(e) => setD({ ...d, calendly_url: e.target.value })} className={input()} placeholder="https://calendly.com/..." /></Field>
        <Field label="Primary CTA label"><input value={d.cta_primary_label ?? ""} onChange={(e) => setD({ ...d, cta_primary_label: e.target.value })} className={input()} /></Field>
        <div className="md:col-span-2">
          <Field label="What you get (free text, supports line breaks)">
            <textarea rows={4} value={d.details_md ?? ""} onChange={(e) => setD({ ...d, details_md: e.target.value })} className={input("resize-none")} />
          </Field>
        </div>
      </div>
      <div className="mt-5"><SaveBtn onClick={save} /></div>
    </GlassCard>
  );
}

function PortfolioTab() {
  const { data: items = [] } = usePortfolioItems();
  const qc = useQueryClient();

  const add = async () => {
    await supabase.from("portfolio_items").insert({ title: "New Project", sort_order: items.length + 1 });
    qc.invalidateQueries({ queryKey: ["portfolio_items"] });
  };
  const update = async (id: string, patch: any) => {
    await supabase.from("portfolio_items").update(patch).eq("id", id);
    qc.invalidateQueries({ queryKey: ["portfolio_items"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("portfolio_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["portfolio_items"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Portfolio Projects</h3>
        <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
          <Plus className="h-3.5 w-3.5" /> Add project
        </button>
      </div>
      {items.map((item) => <PortfolioRow key={item.id} item={item} onSave={update} onDelete={remove} />)}
    </div>
  );
}

function PortfolioRow({ item, onSave, onDelete }: { item: any; onSave: (id: string, p: any) => void; onDelete: (id: string) => void }) {
  const [d, setD] = useState(item);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${item.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      setD({ ...d, image_url: data.publicUrl });
    }
    setUploading(false);
  };

  return (
    <GlassCard className="p-5">
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="space-y-2">
          {d.image_url ? (
            <img src={d.image_url} alt="" className="h-32 w-full rounded-xl object-cover" />
          ) : (
            <div className="grid h-32 place-items-center rounded-xl bg-white/5 text-muted-foreground"><ImageIcon className="h-6 w-6" /></div>
          )}
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="w-full text-xs file:mr-2 file:rounded-full file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-xs" />
          {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title"><input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className={input()} /></Field>
          <Field label="Category"><input value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })} className={input()} /></Field>
          <Field label="Project URL"><input value={d.project_url ?? ""} onChange={(e) => setD({ ...d, project_url: e.target.value })} className={input()} /></Field>
          <Field label="Sort order"><input type="number" value={d.sort_order} onChange={(e) => setD({ ...d, sort_order: +e.target.value })} className={input()} /></Field>
          <div className="sm:col-span-2">
            <Field label="Description"><textarea rows={2} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} className={input("resize-none")} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={d.featured} onChange={(e) => setD({ ...d, featured: e.target.checked })} /> Featured
          </label>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => onDelete(item.id)} className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive hover:bg-destructive/20">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
        <SaveBtn label="Save" onClick={() => onSave(item.id, d)} />
      </div>
    </GlassCard>
  );
}

function StatsTab() {
  const { data: items = [] } = useAllStatsItems();
  const qc = useQueryClient();

  const add = async () => {
    await supabase.from("stats_items").insert({
      label: "New Stat",
      value: 0,
      prefix: "",
      suffix: "+",
      icon: "Sparkles",
      sort_order: items.length + 1,
    });
    qc.invalidateQueries({ queryKey: ["stats_items"] });
    qc.invalidateQueries({ queryKey: ["stats_items_all"] });
  };

  const update = async (id: string, patch: any) => {
    await supabase.from("stats_items").update(patch).eq("id", id);
    qc.invalidateQueries({ queryKey: ["stats_items"] });
    qc.invalidateQueries({ queryKey: ["stats_items_all"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this stat?")) return;
    await supabase.from("stats_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["stats_items"] });
    qc.invalidateQueries({ queryKey: ["stats_items_all"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Stats / Metrics</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Edit, reorder, add, or remove stats. Animations and styling are inherited automatically.
          </p>
        </div>
        <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
          <Plus className="h-3.5 w-3.5" /> Add stat
        </button>
      </div>

      {/* Live preview */}
      <GlassCard className="p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Live preview</div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          {items.filter((i) => i.visible).map((s) => (
            <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <div className="text-2xl font-bold tracking-tight text-gradient">
                {s.prefix}{Number(s.value).toLocaleString()}{s.suffix}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {items.map((item) => <StatRow key={item.id} item={item} onSave={update} onDelete={remove} />)}
    </div>
  );
}

function StatRow({ item, onSave, onDelete }: { item: any; onSave: (id: string, p: any) => void; onDelete: (id: string) => void }) {
  const [d, setD] = useState(item);
  return (
    <GlassCard className="p-5">
      <div className="grid gap-3 md:grid-cols-6">
        <div className="md:col-span-2">
          <Field label="Label / Title">
            <input value={d.label} onChange={(e) => setD({ ...d, label: e.target.value })} className={input()} />
          </Field>
        </div>
        <Field label="Value">
          <input type="number" value={d.value} onChange={(e) => setD({ ...d, value: +e.target.value })} className={input()} />
        </Field>
        <Field label="Prefix">
          <input value={d.prefix ?? ""} onChange={(e) => setD({ ...d, prefix: e.target.value })} className={input()} placeholder="$" />
        </Field>
        <Field label="Suffix">
          <input value={d.suffix ?? ""} onChange={(e) => setD({ ...d, suffix: e.target.value })} className={input()} placeholder="+ / % / x" />
        </Field>
        <Field label="Sort">
          <input type="number" value={d.sort_order} onChange={(e) => setD({ ...d, sort_order: +e.target.value })} className={input()} />
        </Field>
        <div className="md:col-span-3">
          <Field label="Icon (lucide name)">
            <input value={d.icon ?? ""} onChange={(e) => setD({ ...d, icon: e.target.value })} className={input()} placeholder="Briefcase, Heart, TrendingUp, Building2, Award..." />
          </Field>
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" checked={d.visible} onChange={(e) => setD({ ...d, visible: e.target.checked })} />
          <BarChart3 className="h-3.5 w-3.5 text-primary" /> Visible
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => onDelete(item.id)} className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive hover:bg-destructive/20">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
        <SaveBtn label="Save stat" onClick={() => onSave(item.id, d)} />
      </div>
    </GlassCard>
  );
}

/* =========================================================
   PAYMENTS & FINANCE
========================================================= */

const CURRENCIES = ["USD","EUR","GBP","AED","SAR","PHP","CAD","AUD","INR","JPY","SGD","HKD"];
const fmtMoney = (n: number, ccy: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: ccy, maximumFractionDigits: 2 }).format(Number(n));

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-green-500/15 text-green-300 border-green-400/30",
    pending: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    failed: "bg-red-500/15 text-red-300 border-red-400/30",
    cancelled: "bg-white/5 text-muted-foreground border-white/15",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status] ?? map.pending}`}>{status}</span>;
}

function PaymentsTab() {
  return (
    <div className="space-y-8">
      <InvoiceCreator />
      <InvoiceList />
      <QrCodeManager />
    </div>
  );
}

function InvoiceCreator() {
  const { data: plans = [] } = usePricingPlans();
  const qc = useQueryClient();
  const create = useServerFn(createInvoice);
  const previewFx = useServerFn(previewFxRate);

  const [planId, setPlanId] = useState<string>("");
  const [planName, setPlanName] = useState("");
  const [usd, setUsd] = useState<number>(500);
  const [currency, setCurrency] = useState("USD");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientWebsite, setClientWebsite] = useState("");
  const [method, setMethod] = useState<"wise"|"qr"|"card"|"">("wise");
  const [dueDays, setDueDays] = useState(7);
  const [notes, setNotes] = useState("");
  const [fx, setFx] = useState<{ rate: number; converted: number; source: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (currency === "USD") { setFx({ rate: 1, converted: usd, source: "identity" }); return; }
    let stop = false;
    previewFx({ data: { from: "USD", to: currency, amount: usd } }).then((r) => { if (!stop) setFx(r); }).catch(() => {});
    return () => { stop = true; };
  }, [usd, currency, previewFx]);

  const onPickPlan = (id: string) => {
    setPlanId(id);
    const p: any = plans.find((p: any) => p.id === id);
    if (p) { setPlanName(p.name); if (p.show_price !== false) setUsd(Number(p.price)); }
  };

  const submit = async () => {
    if (!clientName || !planName || !(usd >= 0)) return;
    setBusy(true);
    try {
      await create({ data: {
        plan_id: planId || null,
        plan_name: planName,
        client_name: clientName,
        client_email: clientEmail || null,
        client_company: clientCompany || null,
        client_website: clientWebsite || null,
        usd_amount: Number(usd),
        client_currency: currency,
        due_days: dueDays,
        payment_method: method || null,
        notes: notes || null,
      }});
      qc.invalidateQueries({ queryKey: ["invoices"] });
      setClientName(""); setClientEmail(""); setClientCompany(""); setClientWebsite(""); setNotes("");
    } finally { setBusy(false); }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /><h3 className="text-lg font-bold">Create Invoice</h3></div>
      <p className="mt-1 text-xs text-muted-foreground">USD-based pricing. Live FX snapshot is captured at creation time.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Field label="Plan (from Pricing)">
          <select value={planId} onChange={(e) => onPickPlan(e.target.value)} className={input()}>
            <option value="">— Custom —</option>
            {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.show_price === false ? "Custom" : `$${p.price}`})</option>)}
          </select>
        </Field>
        <Field label="Plan name on invoice">
          <input value={planName} onChange={(e) => setPlanName(e.target.value)} className={input()} placeholder="e.g. Premium Website Package" />
        </Field>
        <Field label="USD amount">
          <input type="number" min={0} value={usd} onChange={(e) => setUsd(Number(e.target.value))} className={input()} />
        </Field>

        <Field label="Client name *">
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} className={input()} />
        </Field>
        <Field label="Client email">
          <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className={input()} />
        </Field>
        <Field label="Company">
          <input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} className={input()} />
        </Field>

        <Field label="Website">
          <input value={clientWebsite} onChange={(e) => setClientWebsite(e.target.value)} className={input()} />
        </Field>
        <Field label="Client currency">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={input()}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Payment method">
          <select value={method} onChange={(e) => setMethod(e.target.value as any)} className={input()}>
            <option value="wise">Wise (multi-currency)</option>
            <option value="qr">QR Code</option>
            <option value="card">Card (Stripe/Xendit)</option>
            <option value="">—</option>
          </select>
        </Field>

        <Field label="Due in (days)">
          <input type="number" min={0} value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))} className={input()} />
        </Field>
        <Field label="Notes (optional)">
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className={input()} />
        </Field>
        <div className="md:col-span-1">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Live FX</div>
            <div className="mt-1">{fmtMoney(usd, "USD")}</div>
            {fx && currency !== "USD" && (
              <>
                <div className="text-xs text-muted-foreground">1 USD = {fx.rate.toFixed(4)} {currency}</div>
                <div className="mt-1 font-bold text-gradient">{fmtMoney(fx.converted, currency)}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">via {fx.source}</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <SaveBtn label={busy ? "Generating…" : "Generate Invoice"} onClick={submit} />
      </div>
    </GlassCard>
  );
}

function InvoiceList() {
  const { data: invoices = [] } = useInvoices();
  const qc = useQueryClient();
  const markPaid = useServerFn(markInvoicePaid);
  const setStatus = useServerFn(updateInvoiceStatus);
  const del = useServerFn(deleteInvoice);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"pending"|"paid"|"failed"|"cancelled">("all");

  const rows = invoices.filter((i: any) => {
    if (filter !== "all" && i.status !== filter) return false;
    if (search && !`${i.invoice_number} ${i.client_name} ${i.plan_name}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <GlassCard className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Transaction History</h3>
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice / client" className={input("max-w-xs")} />
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className={input("max-w-[140px]")}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-white/10">
              <th className="py-2 text-left">Invoice</th>
              <th className="text-left">Client</th>
              <th className="text-left">Plan</th>
              <th className="text-right">USD</th>
              <th className="text-right">Converted</th>
              <th className="text-left">Method</th>
              <th className="text-left">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i: any) => (
              <tr key={i.id} className="border-b border-white/5">
                <td className="py-3">
                  <a href={`/invoice/${i.id}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-primary hover:underline inline-flex items-center gap-1">
                    {i.invoice_number} <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="text-[10px] text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</div>
                </td>
                <td>{i.client_name}<div className="text-[10px] text-muted-foreground">{i.client_email}</div></td>
                <td>{i.plan_name}</td>
                <td className="text-right">{fmtMoney(i.usd_amount, "USD")}</td>
                <td className="text-right">
                  {fmtMoney(i.converted_amount, i.client_currency)}
                  <div className="text-[10px] text-muted-foreground">@ {Number(i.fx_rate).toFixed(4)}</div>
                </td>
                <td className="capitalize">
                  {i.payment_method ?? "—"}
                  {(i.payment_method === "wise" || i.payment_method === "card") && (
                    <div className="text-[10px] text-blue-300/80">auto-verified</div>
                  )}
                  {i.payment_method === "qr" && i.verification_status === "pending_review" && (
                    <div className="text-[10px] text-amber-300">awaiting admin review</div>
                  )}
                  {i.payment_method === "qr" && i.verification_status === "awaiting_proof" && (
                    <div className="text-[10px] text-muted-foreground">awaiting customer proof</div>
                  )}
                  {i.verification_reference && (
                    <div className="text-[10px] text-muted-foreground font-mono">ref: {i.verification_reference}</div>
                  )}
                  {i.verification_proof_url && (
                    <a href={i.verification_proof_url} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline">view proof ↗</a>
                  )}
                </td>
                <td><StatusPill status={i.status} /></td>
                <td className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <a href={`/api/public/invoices/${i.id}/pdf`} target="_blank" rel="noreferrer" title="Download PDF" className="rounded-md p-1.5 hover:bg-white/10"><Download className="h-3.5 w-3.5" /></a>
                    {i.status !== "paid" && i.payment_method !== "wise" && i.payment_method !== "card" && (
                      <button
                        title={i.verification_status === "pending_review" ? "Verify & mark paid" : "Mark paid (manual / QR only)"}
                        onClick={async () => {
                          try {
                            await markPaid({ data: { id: i.id } });
                            qc.invalidateQueries({ queryKey: ["invoices"] });
                          } catch (e: any) {
                            alert(e?.message ?? "Could not mark as paid.");
                          }
                        }}
                        className="rounded-md p-1.5 text-green-300 hover:bg-green-500/10"
                      >✓</button>
                    )}
                    {i.status !== "cancelled" && i.status !== "paid" && (
                      <button title="Cancel" onClick={async () => { await setStatus({ data: { id: i.id, status: "cancelled" } }); qc.invalidateQueries({ queryKey: ["invoices"] }); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-white/10">⊘</button>
                    )}
                    <button title="Delete" onClick={async () => { if (confirm("Delete invoice?")) { await del({ data: { id: i.id } }); qc.invalidateQueries({ queryKey: ["invoices"] }); } }} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">No invoices yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function QrCodeManager() {
  const { data: qrCodes = [] } = useQrCodes();
  const { data: plans = [] } = usePricingPlans();
  const qc = useQueryClient();

  const [label, setLabel] = useState("");
  const [planId, setPlanId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (!label) { alert("Add a label first"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `qr-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-qr").upload(path, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("payment-qr").getPublicUrl(path);
      await supabase.from("payment_qr_codes").insert({ label, plan_id: planId || null, currency, image_url: data.publicUrl });
      setLabel(""); setPlanId("");
      qc.invalidateQueries({ queryKey: ["payment_qr_codes"] });
    } catch (e: any) {
      alert(e.message);
    } finally { setUploading(false); }
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("payment_qr_codes").update({ active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["payment_qr_codes"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this QR code?")) return;
    await supabase.from("payment_qr_codes").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["payment_qr_codes"] });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2"><QrCode className="h-4 w-4 text-primary" /><h3 className="text-lg font-bold">QR Code Management</h3></div>
      <p className="mt-1 text-xs text-muted-foreground">Upload payment QR codes shown on the invoice page. Plan-linked QR is auto-matched per invoice.</p>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Field label="Label"><input value={label} onChange={(e) => setLabel(e.target.value)} className={input()} placeholder="e.g. $500 Plan QR" /></Field>
        <Field label="Linked plan (optional)">
          <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={input()}>
            <option value="">— Fallback (any plan) —</option>
            {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Currency">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={input()}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Upload QR image">
          <input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className={input()} />
        </Field>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {qrCodes.map((q: any) => (
          <div key={q.id} className="glass rounded-xl p-4">
            <img src={q.image_url} alt={q.label} className="aspect-square w-full rounded-lg bg-white p-2 object-contain" />
            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-sm">{q.label}</div>
                <div className="text-[10px] text-muted-foreground">{q.currency} · {q.plan_id ? "Plan-linked" : "Fallback"}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggle(q.id, !q.active)} className={`rounded-md px-2 py-1 text-[10px] ${q.active ? "bg-green-500/15 text-green-300" : "bg-white/5 text-muted-foreground"}`}>{q.active ? "Active" : "Off"}</button>
                <button onClick={() => remove(q.id)} className="rounded-md p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
        ))}
        {qrCodes.length === 0 && <div className="col-span-full py-10 text-center text-sm text-muted-foreground">No QR codes yet.</div>}
      </div>
    </GlassCard>
  );
}

/* =========================================================
   REVENUE & ANALYTICS
========================================================= */
function RevenueTab() {
  const { data: invoices = [] } = useInvoices();
  const paid = invoices.filter((i: any) => i.status === "paid");
  const pending = invoices.filter((i: any) => i.status === "pending");
  const failed = invoices.filter((i: any) => i.status === "failed");

  const totalUsd = paid.reduce((s: number, i: any) => s + Number(i.usd_amount), 0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const monthlyUsd = paid.filter((i: any) => new Date(i.paid_at ?? i.created_at) >= monthStart)
    .reduce((s: number, i: any) => s + Number(i.usd_amount), 0);

  const byPlan = new Map<string, number>();
  paid.forEach((i: any) => byPlan.set(i.plan_name, (byPlan.get(i.plan_name) ?? 0) + Number(i.usd_amount)));

  const byCurrency = new Map<string, number>();
  paid.forEach((i: any) => byCurrency.set(i.client_currency, (byCurrency.get(i.client_currency) ?? 0) + Number(i.converted_amount)));

  const wisePaid = paid.filter((i: any) => i.payment_method === "wise");
  const conversionRate = invoices.length ? (paid.length / invoices.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <KPI icon={<TrendingUp className="h-4 w-4" />} label="Total Revenue (USD)" value={fmtMoney(totalUsd, "USD")} />
        <KPI icon={<TrendingUp className="h-4 w-4" />} label="This Month" value={fmtMoney(monthlyUsd, "USD")} />
        <KPI icon={<Receipt className="h-4 w-4" />} label="Conversion Rate" value={`${conversionRate.toFixed(1)}%`} sub={`${paid.length}/${invoices.length} paid`} />
        <KPI icon={<BarChart3 className="h-4 w-4" />} label="Wise Transactions" value={String(wisePaid.length)} sub={`of ${paid.length} paid invoices`} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <KPI label="Paid" value={String(paid.length)} accent="green" />
        <KPI label="Pending" value={String(pending.length)} accent="amber" />
        <KPI label="Failed" value={String(failed.length)} accent="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Revenue by Plan (USD)</h3>
          <div className="mt-4 space-y-3">
            {[...byPlan.entries()].sort((a,b) => b[1]-a[1]).map(([plan, total]) => {
              const pct = totalUsd ? (total/totalUsd)*100 : 0;
              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm"><span>{plan}</span><span className="font-semibold">{fmtMoney(total, "USD")}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} /></div>
                </div>
              );
            })}
            {byPlan.size === 0 && <div className="text-sm text-muted-foreground">No paid invoices yet.</div>}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Revenue by Currency</h3>
          <div className="mt-4 space-y-3">
            {[...byCurrency.entries()].map(([ccy, total]) => (
              <div key={ccy} className="flex justify-between border-b border-white/5 pb-2 text-sm">
                <span className="font-mono">{ccy}</span>
                <span className="font-semibold">{fmtMoney(total, ccy)}</span>
              </div>
            ))}
            {byCurrency.size === 0 && <div className="text-sm text-muted-foreground">No paid invoices yet.</div>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function KPI({ icon, label, value, sub, accent }: { icon?: React.ReactNode; label: string; value: string; sub?: string; accent?: "green"|"amber"|"red" }) {
  const accentCls = accent === "green" ? "text-green-300" : accent === "amber" ? "text-amber-300" : accent === "red" ? "text-red-300" : "text-gradient";
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{icon}{label}</div>
      <div className={`mt-2 text-2xl font-bold ${accentCls}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </GlassCard>
  );
}
