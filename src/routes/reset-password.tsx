import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui-premium/GlassCard";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) setMsg(error.message);
    else { setMsg("Password updated. Redirecting..."); setTimeout(() => navigate({ to: "/admin" }), 1500); }
    setLoading(false);
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <AuroraBackground className="opacity-50" />
      <GlassCard className="relative w-full max-w-md p-8">
        <h1 className="text-center text-2xl font-bold text-gradient">Set New Password</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={8}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {msg && <p className="text-center text-xs text-muted-foreground">{msg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
