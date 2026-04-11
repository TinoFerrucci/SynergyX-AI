import { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Zap,
  Shield,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import {
  generateTeamOptions,
  fetchProfiles,
  type TeamGenerationResponse,
  type UserProfile,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FOCUS_OPTIONS = [
  { value: "balanced", label: "Balanced", desc: "Well-rounded team for most projects" },
  { value: "speed", label: "Speed", desc: "Fast execution, generalists over specialists" },
  { value: "quality", label: "Quality", desc: "Senior-heavy, specialists, proven track records" },
  { value: "innovation", label: "Innovation", desc: "Diverse backgrounds, creative thinkers" },
  { value: "cost-effective", label: "Cost-Effective", desc: "Lean team with high-impact individuals" },
];

const OPTION_ICONS = [Zap, Shield, Lightbulb];
const OPTION_COLORS = [
  { accent: "text-accent", bg: "bg-accent-subtle", bar: "bg-accent" },
  { accent: "text-green", bg: "bg-green-subtle", bar: "bg-green" },
  { accent: "text-orange", bg: "bg-orange-subtle", bar: "bg-orange" },
];

const AVATAR_COLORS = [
  "bg-accent-subtle text-accent-text",
  "bg-blue-subtle text-blue",
  "bg-green-subtle text-green",
  "bg-violet-subtle text-violet",
  "bg-orange-subtle text-orange",
  "bg-cyan-subtle text-cyan",
  "bg-amber-subtle text-amber",
  "bg-red-subtle text-red",
];

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function TeamOptionCard({
  option,
  profiles,
  index,
}: {
  option: TeamGenerationResponse["options"][0];
  profiles: UserProfile[];
  index: number;
}) {
  const color = OPTION_COLORS[index % OPTION_COLORS.length];
  const Icon = OPTION_ICONS[index % OPTION_ICONS.length];
  const getProfile = (id: string) => profiles.find((p) => p.id === id);

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
      <Card className="overflow-hidden" padding={false}>
        <div className={`h-1 ${color.bar}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center`}>
                <Icon size={16} className={color.accent} />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${color.accent}`}>{option.option_name}</h3>
                <p className="text-[11px] text-text-tertiary">{option.selected_members.length} members</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-0.5 text-xs font-semibold text-text">
                {option.estimated_cost_index.split("").map((_, i) => (
                  <DollarSign key={i} size={12} className="text-amber" />
                ))}
              </div>
              <Badge variant="amber" className="mt-0.5">{option.cost_tier}</Badge>
            </div>
          </div>

          <div className="space-y-1.5 mb-4">
            {option.selected_members.map((member) => {
              const profile = getProfile(member.user_id);
              const name = profile?.full_name || member.user_id;
              const cIdx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
              return (
                <div key={member.user_id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-bg-subtle transition-colors">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${AVATAR_COLORS[cIdx]}`}>
                    {getInitials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text truncate">{name}</p>
                    <p className="text-[10px] text-text-tertiary truncate">{member.assigned_role}</p>
                  </div>
                  {profile && (
                    <Badge variant="default" className="text-[9px]">{profile.seniority_level}</Badge>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="rounded-lg bg-green-subtle/60 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={10} className="text-green" />
                <p className="text-[10px] font-semibold text-green uppercase tracking-wider">Synergy</p>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{option.synergy_explanation}</p>
            </div>
            <div className="rounded-lg bg-amber-subtle/60 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={10} className="text-amber" />
                <p className="text-[10px] font-semibold text-amber uppercase tracking-wider">Skill Gap</p>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{option.skill_gap}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ProjectPage() {
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [focus, setFocus] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TeamGenerationResponse | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profileCount, setProfileCount] = useState<number | null>(null);

  useEffect(() => {
    fetchProfiles().then((p) => { setProfiles(p); setProfileCount(p.length); }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!description.trim()) { setError("Please enter a project description"); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const all = await fetchProfiles();
      setProfiles(all);
      setProfileCount(all.length);
      const data = await generateTeamOptions(description, teamSize, focus);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Team Builder</h1>
        <p className="text-sm text-text-secondary mt-0.5">Describe your project and get 3 AI-generated team configurations.</p>
      </div>

      <Card>
        <div className="space-y-5">
          <Textarea
            id="desc"
            label="Project Description"
            hint="Include goals, technologies, timeline, and specific needs."
            placeholder="E.g., Build a fintech platform with React frontend, Python microservices backend, ML-powered fraud detection, and mobile companion app. Launch in 4 months."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-text mb-2">Team Focus</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFocus(opt.value)}
                  className={`text-left rounded-lg border p-3 transition-all duration-150 cursor-pointer ${
                    focus === opt.value
                      ? "border-accent bg-accent-subtle"
                      : "border-border hover:border-border-strong bg-surface"
                  }`}
                >
                  <p className={`text-xs font-semibold ${focus === opt.value ? "text-accent-text" : "text-text"}`}>{opt.label}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-4">
            <Input id="size" label="Team Size" type="number" min={2} max={15} value={teamSize} onChange={(e) => setTeamSize(parseInt(e.target.value) || 4)} className="w-28" />
            <div className="flex-1" />
            {profileCount !== null && (
              <Badge variant={profileCount >= teamSize ? "green" : "red"} dot>
                {profileCount} profiles
              </Badge>
            )}
            <Button
              size="lg"
              onClick={handleGenerate}
              loading={loading}
              disabled={!description.trim() || loading || (profileCount !== null && profileCount < teamSize)}
            >
              <Sparkles size={16} />
              Generate
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </Card>

      {error && <div className="rounded-lg bg-red-subtle border border-red/20 p-3 text-sm text-red">{error}</div>}

      {loading && (
        <div className="flex flex-col items-center py-16 gap-4 animate-fade-in">
          <Loader2 className="animate-spin text-accent" size={28} />
          <div className="text-center">
            <p className="text-sm font-medium text-text">Analyzing talent pool...</p>
            <p className="text-xs text-text-tertiary mt-0.5">Evaluating candidates and composing team options</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text">Team Options</h2>
              <p className="text-xs text-text-tertiary">{result.options.length} configurations for a team of {result.team_size} &middot; Focus: {result.focus}</p>
            </div>
            <Badge variant="accent">{result.team_size} members</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {result.options.map((opt, i) => (
              <TeamOptionCard key={i} option={opt} profiles={profiles} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
