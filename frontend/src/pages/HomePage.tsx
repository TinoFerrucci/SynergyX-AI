import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FolderKanban,
  Upload,
  Sparkles,
  ArrowRight,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { fetchProfiles, type UserProfile } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AVATAR_COLORS = [
  "bg-accent-subtle text-accent-text",
  "bg-blue-subtle text-blue",
  "bg-green-subtle text-green",
  "bg-violet-subtle text-violet",
  "bg-orange-subtle text-orange",
  "bg-cyan-subtle text-cyan",
];

const STEPS = [
  { label: "Upload CVs", desc: "Add your team members' resumes", icon: Upload },
  { label: "Define Project", desc: "Describe what you're building", icon: FolderKanban },
  { label: "Get Teams", desc: "AI suggests optimal configurations", icon: Sparkles },
];

export function HomePage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetchProfiles().then(setProfiles).catch(() => {});
  }, []);

  const techCount = profiles.reduce((a, p) => a + p.core_technologies.length, 0);
  const roleCount = new Set(profiles.flatMap((p) => p.possible_roles)).size;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="flex items-stretch">
          <div className="flex-1 p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="SynergyX" className="h-8 w-8 object-contain" />
              <Badge variant="accent">AI-Powered</Badge>
            </div>
            <h1 className="text-2xl font-semibold text-text tracking-tight">
              Build the right team<br />
              for <span className="brand-text">any project</span>
            </h1>
            <p className="text-sm text-text-secondary mt-2.5 max-w-md leading-relaxed">
              SynergyX analyzes your talent pool with embeddings and LLMs to suggest
              optimal team configurations with cost tiers and synergy analysis.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <Link to="/talent">
                <Button size="lg">
                  <Upload size={16} />
                  Upload CVs
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="secondary" size="lg">
                  <Sparkles size={16} />
                  Generate Teams
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center w-72 brand-gradient p-8">
            <img src="/logo.png" alt="SynergyX" className="h-32 w-32 object-contain opacity-90" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Profiles", value: profiles.length, icon: Users, color: "text-accent" },
          { label: "Skills", value: techCount, icon: FileText, color: "text-blue" },
          { label: "Roles", value: roleCount, icon: FolderKanban, color: "text-violet" },
          { label: "Status", value: profiles.length > 0 ? "Ready" : "Empty", icon: CheckCircle2, color: profiles.length > 0 ? "text-green" : "text-text-tertiary" },
        ].map((s) => (
          <Card key={s.label} hover padding={false}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon size={14} className="text-text-tertiary" />
                <span className="text-[9px] font-medium text-text-tertiary uppercase tracking-wider">{s.label}</span>
              </div>
              <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text mb-4">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface shadow-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-8 h-8 rounded-lg bg-bg-subtle border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-text-secondary">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">{step.label}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {profiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text">Recent profiles</h2>
            <Link to="/talent" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {profiles.slice(0, 4).map((p) => {
              const cIdx = p.full_name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
              return (
                <Card key={p.id} hover padding={false}>
                  <div className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${AVATAR_COLORS[cIdx]}`}>
                        {p.full_name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text truncate">{p.full_name}</p>
                        <p className="text-[10px] text-text-tertiary truncate">{p.possible_roles[0] || "Unknown"}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {p.core_technologies.slice(0, 3).map((t) => (
                        <Badge key={t} variant="default" className="text-[9px]">{t}</Badge>
                      ))}
                      {p.core_technologies.length > 3 && (
                        <Badge variant="default" className="text-[9px]">+{p.core_technologies.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
