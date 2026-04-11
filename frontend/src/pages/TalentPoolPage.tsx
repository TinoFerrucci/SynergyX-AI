import { useCallback, useState, useEffect, useRef } from "react";
import {
  FileText,
  Trash2,
  Loader2,
  Upload,
  Search,
  Pencil,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from "lucide-react";
import {
  uploadCV,
  fetchProfiles,
  deleteProfile,
  updateProfile,
  type UserProfile,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const seniorityMap: Record<string, { variant: "green" | "blue" | "orange" | "violet" | "amber"; label: string }> = {
  junior: { variant: "green", label: "Junior" },
  "mid-level": { variant: "blue", label: "Mid-Level" },
  mid: { variant: "blue", label: "Mid-Level" },
  senior: { variant: "orange", label: "Senior" },
  lead: { variant: "violet", label: "Lead" },
  principal: { variant: "amber", label: "Principal" },
  staff: { variant: "amber", label: "Staff" },
};

function getSeniority(level: string) {
  return seniorityMap[level.toLowerCase().trim()] || { variant: "blue" as const, label: level };
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const PALETTE = [
  "bg-accent-subtle text-accent-text",
  "bg-blue-subtle text-blue",
  "bg-green-subtle text-green",
  "bg-violet-subtle text-violet",
  "bg-orange-subtle text-orange",
  "bg-cyan-subtle text-cyan",
  "bg-amber-subtle text-amber",
  "bg-red-subtle text-red",
];

function getColor(s: string) {
  const idx = s.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length;
  return PALETTE[idx];
}

type SortKey = "name" | "seniority" | "roles" | "tech";

function ProfileCard({
  profile,
  onRemove,
  onEdit,
  index,
}: {
  profile: UserProfile;
  onRemove: () => void;
  onEdit: () => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const sen = getSeniority(profile.seniority_level);

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
      <Card hover className="relative group">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getColor(profile.full_name)}`}>
            {getInitials(profile.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text truncate">{profile.full_name}</h3>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant={sen.variant} dot>{sen.label}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text hover:bg-bg-subtle transition-colors cursor-pointer">
              <Pencil size={13} />
            </button>
            <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-red hover:bg-red-subtle transition-colors cursor-pointer">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          <div>
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Roles</p>
            <div className="flex flex-wrap gap-1">
              {profile.possible_roles.map((r) => (
                <Badge key={r} variant="accent">{r}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Technologies</p>
            <div className="flex flex-wrap gap-1">
              {(expanded ? profile.core_technologies : profile.core_technologies.slice(0, 6)).map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
              {!expanded && profile.core_technologies.length > 6 && (
                <Badge variant="default">+{profile.core_technologies.length - 6}</Badge>
              )}
            </div>
          </div>
          {expanded && (
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Knowledge</p>
              <div className="flex flex-wrap gap-1">
                {profile.knowledge_areas.map((a) => (
                  <Badge key={a} variant="blue">{a}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {(profile.core_technologies.length > 6 || profile.knowledge_areas.length > 4) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Less" : "More"}
          </button>
        )}
      </Card>
    </div>
  );
}

function EditProfileModal({
  profile,
  open,
  onClose,
  onSaved,
}: {
  profile: UserProfile;
  open: boolean;
  onClose: () => void;
  onSaved: (p: UserProfile) => void;
}) {
  const [name, setName] = useState("");
  const [seniority, setSeniority] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [techs, setTechs] = useState<string[]>([]);
  const [knowledge, setKnowledge] = useState<string[]>([]);
  const [newRole, setNewRole] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newKnowledge, setNewKnowledge] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setName(profile.full_name);
      setSeniority(profile.seniority_level);
      setRoles([...profile.possible_roles]);
      setTechs([...profile.core_technologies]);
      setKnowledge([...profile.knowledge_areas]);
    }
  }, [open, profile]);

  const addRole = () => {
    if (newRole.trim() && !roles.includes(newRole.trim())) {
      setRoles([...roles, newRole.trim()]);
      setNewRole("");
    }
  };
  const addTech = () => {
    if (newTech.trim() && !techs.includes(newTech.trim())) {
      setTechs([...techs, newTech.trim()]);
      setNewTech("");
    }
  };
  const addKnowledge = () => {
    if (newKnowledge.trim() && !knowledge.includes(newKnowledge.trim())) {
      setKnowledge([...knowledge, newKnowledge.trim()]);
      setNewKnowledge("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(profile.id, {
        full_name: name,
        seniority_level: seniority,
        possible_roles: roles,
        core_technologies: techs,
        knowledge_areas: knowledge,
      });
      onSaved(updated);
      onClose();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile" width="max-w-xl">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Seniority</label>
          <select
            value={seniority}
            onChange={(e) => setSeniority(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-shadow cursor-pointer"
          >
            {["Junior", "Mid-Level", "Senior", "Lead", "Principal", "Staff"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <TagEditor label="Roles" items={roles} setItems={setRoles} newItem={newRole} setNewItem={setNewRole} onAdd={addRole} />
        <TagEditor label="Technologies" items={techs} setItems={setTechs} newItem={newTech} setNewItem={setNewTech} onAdd={addTech} />
        <TagEditor label="Knowledge Areas" items={knowledge} setItems={setKnowledge} newItem={newKnowledge} setNewItem={setNewKnowledge} onAdd={addKnowledge} />

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}

function TagEditor({
  label,
  items,
  setItems,
  newItem,
  setNewItem,
  onAdd,
}: {
  label: string;
  items: string[];
  setItems: (v: string[]) => void;
  newItem: string;
  setNewItem: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-md bg-bg-subtle border border-border px-2 py-1 text-xs text-text">
            {item}
            <button
              onClick={() => setItems(items.filter((i) => i !== item))}
              className="text-text-tertiary hover:text-red cursor-pointer"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
          placeholder={`Add ${label.toLowerCase().replace(" areas", "")}...`}
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-shadow"
        />
        <Button variant="secondary" size="sm" onClick={onAdd}>
          <Plus size={12} /> Add
        </Button>
      </div>
    </div>
  );
}

export function TalentPoolPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchProfiles();
      setProfiles(data);
      setLoaded(true);
    } catch {
      setError("Could not load profiles. Make sure the backend is running.");
    }
  }, []);

  useEffect(() => { if (!loaded) load(); }, [loaded, load]);

  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    setError(null);
    const arr = Array.from(files);
    for (const f of arr) {
      try {
        const p = await uploadCV(f);
        setProfiles((prev) => [...prev, p]);
        setUploadMsg(`${p.full_name} added`);
        setTimeout(() => setUploadMsg(null), 3000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (id: string) => {
    await deleteProfile(id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = profiles
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.full_name.toLowerCase().includes(q) ||
        p.possible_roles.some((r) => r.toLowerCase().includes(q)) ||
        p.core_technologies.some((t) => t.toLowerCase().includes(q)) ||
        p.knowledge_areas.some((a) => a.toLowerCase().includes(q)) ||
        p.seniority_level.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.full_name.localeCompare(b.full_name);
      if (sortBy === "seniority") return a.seniority_level.localeCompare(b.seniority_level);
      if (sortBy === "roles") return b.possible_roles.length - a.possible_roles.length;
      return b.core_technologies.length - a.core_technologies.length;
    });

  const techCount = profiles.reduce((a, p) => a + p.core_technologies.length, 0);
  const roleCount = new Set(profiles.flatMap((p) => p.possible_roles)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Talent Pool</h1>
          <p className="text-sm text-text-secondary mt-0.5">Upload CVs and manage your talent database.</p>
        </div>
        {loaded && profiles.length > 0 && (
          <div className="flex items-center gap-5 text-center">
            <div><p className="text-lg font-semibold text-text">{profiles.length}</p><p className="text-[10px] text-text-tertiary uppercase tracking-wider">Profiles</p></div>
            <div className="w-px h-8 bg-border" />
            <div><p className="text-lg font-semibold text-text">{techCount}</p><p className="text-[10px] text-text-tertiary uppercase tracking-wider">Skills</p></div>
            <div className="w-px h-8 bg-border" />
            <div><p className="text-lg font-semibold text-text">{roleCount}</p><p className="text-[10px] text-text-tertiary uppercase tracking-wider">Roles</p></div>
          </div>
        )}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-150 ${
          dragOver ? "border-accent bg-accent-subtle" : "border-border hover:border-border-strong bg-surface"
        }`}
      >
        <input ref={fileRef} type="file" id="cv-upload" accept=".pdf,.txt" multiple className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
        {uploading ? (
          <div className="flex items-center justify-center gap-3 py-10">
            <Loader2 className="animate-spin text-accent" size={20} />
            <div>
              <p className="text-sm font-medium text-text">Parsing CV with AI...</p>
              <p className="text-xs text-text-tertiary">Extracting skills, roles, and seniority</p>
            </div>
          </div>
        ) : (
          <label htmlFor="cv-upload" className="flex items-center gap-4 px-6 py-5 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-bg-subtle border border-border flex items-center justify-center flex-shrink-0">
              <Upload size={18} className="text-text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text">Upload CVs <span className="text-accent font-normal">or drag and drop</span></p>
              <p className="text-xs text-text-tertiary mt-0.5">PDF or TXT. AI parses skills automatically.</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-text-tertiary">
              <span className="px-2 py-1 rounded border border-border bg-bg-subtle">PDF</span>
              <span className="px-2 py-1 rounded border border-border bg-bg-subtle">TXT</span>
            </div>
          </label>
        )}
      </div>

      {error && <div className="rounded-lg bg-red-subtle border border-red/20 p-3 text-sm text-red">{error}</div>}
      {uploadMsg && <div className="rounded-lg bg-green-subtle border border-green/20 p-3 text-sm text-green">{uploadMsg}</div>}

      {profiles.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text" placeholder="Search by name, role, technology..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-shadow"
            />
          </div>
          <select
            value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
          >
            <option value="name">Name</option>
            <option value="seniority">Seniority</option>
            <option value="roles">Most roles</option>
            <option value="tech">Most tech</option>
          </select>
        </div>
      )}

      {filtered.length > 0 && (
        <div>
          <p className="text-xs text-text-tertiary mb-3">{filtered.length} of {profiles.length} profiles</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((p, i) => (
              <ProfileCard key={p.id} profile={p} onRemove={() => handleRemove(p.id)} onEdit={() => setEditProfile(p)} index={i} />
            ))}
          </div>
        </div>
      )}

      {loaded && profiles.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-xl bg-bg-subtle border border-border flex items-center justify-center mx-auto mb-3">
            <FileText size={24} className="text-text-tertiary" />
          </div>
          <p className="text-sm font-medium text-text-secondary">No profiles yet</p>
          <p className="text-xs text-text-tertiary mt-0.5">Upload a CV to get started</p>
        </div>
      )}

      {loaded && profiles.length > 0 && filtered.length === 0 && search && (
        <div className="text-center py-12 text-text-tertiary text-sm">No profiles matching "{search}"</div>
      )}

      {editProfile && (
        <EditProfileModal
          profile={editProfile}
          open={!!editProfile}
          onClose={() => setEditProfile(null)}
          onSaved={(updated) => {
            setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setEditProfile(null);
          }}
        />
      )}
    </div>
  );
}
