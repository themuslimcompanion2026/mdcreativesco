import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AdminLoginModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("mhmd.alyamani27@gmail.com");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    if (mode === "reset") {
      const { error } = await resetPassword(email);
      setMsg(error ?? "Check your inbox for a reset link.");
    } else if (mode === "signup") {
      const { error } = await signUp(email, password);
      if (error) setMsg(error);
      else {
        setMsg("Account created. You're signed in.");
        onOpenChange(false);
        navigate({ to: "/admin" });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) setMsg(error);
      else {
        onOpenChange(false);
        navigate({ to: "/admin" });
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-background/95 backdrop-blur-2xl sm:max-w-md">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{ background: "radial-gradient(600px circle at 50% 0%, oklch(0.7 0.22 255 / 0.18), transparent 60%)" }}
        />
        <DialogHeader>
          <div className="mx-auto flex justify-center">
            <BrandLogo size={56} showWordmark={false} />
          </div>
          <DialogTitle className="text-center text-xl">
            {mode === "reset" ? "Reset Password" : mode === "signup" ? "Create Admin" : "Admin Access"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "reset" ? "We'll send a secure link to your inbox." : "Restricted area. Authorized personnel only."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {mode !== "reset" && (
            <div className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password (min 8 chars)"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}

          {msg && <p className="text-center text-xs text-muted-foreground">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading ? "Please wait..." : mode === "reset" ? "Send Reset Link" : mode === "signup" ? "Create Account" : "Sign In"}
          </button>

          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-muted-foreground hover:text-foreground"
            >
              {mode === "signin" ? "First time? Create account" : "Have an account? Sign in"}
            </button>
            <button
              type="button"
              onClick={() => setMode("reset")}
              className="text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
