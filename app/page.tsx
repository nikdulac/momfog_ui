"use client"

import type React from "react"
import { useMemo, useState } from "react"
import {
  Search,
  Users,
  Calendar,
  MapPin,
  MenuIcon,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  MoreHorizontal,
  Tag,
  Briefcase,
  GraduationCap,
  Home,
  Mic,
  Plus,
  Sliders,
  Lightbulb,
  Settings,
  User,
  Clock,
} from "lucide-react"

// --- Theme: Claude-like minimalism with muted orange accent ----------------
const theme = {
  accent: "#e6b47c", // muted orange
  bg: "#f5f3f0", // beige/cream background like Claude
  text: "#1c1c1c",
  subtext: "#6b6b6b",
  border: "#e5e5e5",
  surface: "#ffffff",
}

// --- Demo data ------------------------------------------------------------
const peopleSeed = [
  {
    id: "c1",
    name: "Craig Bunnell, MD, MPH, MBA",
    avatar: "https://api.dicebear.com/8.x/initials/svg?seed=Craig%20Bunnell",
    primaryRole: "Chief Medical Officer, Dana-Farber Cancer Institute",
    coordinates: { home: "Boston, MA", work: "Longwood Medical Area" },
    orgs: ["Dana-Farber Cancer Institute", "Harvard Medical School"],
    tags: ["oncology", "leadership", "board-level"],
    relations: [
      { type: "spouse", personId: "c3", label: "Spouse" },
      { type: "coworker", personId: "c2", label: "Coworker" },
    ],
    notes: [
      {
        id: "n1",
        date: "2025-10-05",
        text: "Met at Esplanade donor event. Mentioned interest in AI triage for symptom calls.",
        tags: ["event", "AI", "triage"],
      },
      {
        id: "n2",
        date: "2025-10-07",
        text: "Follow-up scheduled re: MomFog pilots for clinician memory cues before consults.",
        tags: ["follow-up", "pilot"],
      },
    ],
    reminders: [{ id: "r1", label: "Intro email re: Civic Roundtable", when: "2025-10-10" }],
  },
  {
    id: "c2",
    name: "Katherine U., RN, MSN",
    avatar: "https://api.dicebear.com/8.x/initials/svg?seed=Katherine%20U",
    primaryRole: "Nurse Manager, Dana-Farber Inpatient Oncology",
    coordinates: { home: "Newton, MA", work: "Longwood Medical Area" },
    orgs: ["Dana-Farber Cancer Institute"],
    tags: ["operations", "nursing", "quality"],
    relations: [{ type: "coworker", personId: "c1", label: "Coworker" }],
    notes: [
      {
        id: "n3",
        date: "2025-09-28",
        text: "Interested in symptom diary reminders for post-discharge patients.",
        tags: ["pilot", "discharge"],
      },
    ],
    reminders: [],
  },
  {
    id: "c3",
    name: "Spouse (placeholder)",
    avatar: "https://api.dicebear.com/8.x/initials/svg?seed=Spouse",
    primaryRole: "—",
    coordinates: { home: "Boston, MA", work: "—" },
    orgs: [],
    tags: ["family"],
    relations: [{ type: "spouse", personId: "c1", label: "Spouse" }],
    notes: [],
    reminders: [],
  },
]

function buildNetworks(people: typeof peopleSeed) {
  const map = new Map<string, typeof peopleSeed>()
  for (const c of people) {
    ;(c.orgs || []).forEach((o) => {
      if (!map.has(o)) map.set(o, [])
      map.get(o)!.push(c)
    })
  }
  return Array.from(map.entries()).map(([name, members]) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    members,
  }))
}

// --- UI primitives --------------------------------------------------------
const Card: React.FC<React.PropsWithChildren<{ className?: string; onClick?: () => void }>> = ({
  children,
  className = "",
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border ${onClick ? "cursor-pointer" : ""} ${className}`}
    style={{ borderColor: theme.border }}
  >
    {children}
  </div>
)

const SectionTitle: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="text-sm font-semibold mb-2" style={{ color: theme.subtext }}>
    {children}
  </div>
)

const Chip: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: "#f2f2f2" }}>
    {children}
  </span>
)

const Collapsible: React.FC<
  React.PropsWithChildren<{
    title: string
    open: boolean
    onToggle: () => void
    icon?: React.ReactNode
  }>
> = ({ title, open, onToggle, children, icon }) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100"
    >
      <div className="flex items-center gap-2">
        {icon && <span style={{ color: theme.subtext }}>{icon}</span>}
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </button>
    {open ? <div className="pl-2 pb-2 space-y-1">{children}</div> : null}
  </div>
)

// --- Left Sidebar (Contacts + Networks) -----------------------------------
const LeftMenu: React.FC<{
  open: boolean
  setOpen: (b: boolean) => void
  onSelectPeople: () => void
  onSelectNetwork: (id: string) => void
  onSelectNetworks: () => void
  networks: { id: string; name: string; members: typeof peopleSeed }[]
  people: typeof peopleSeed
}> = ({ open, setOpen, onSelectPeople, onSelectNetwork, onSelectNetworks, networks, people }) => {
  const [peopleOpen, setPeopleOpen] = useState(false)
  const [networksOpen, setNetworksOpen] = useState(false)
  const [ideasOpen, setIdeasOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)

  return (
    <div
      className={`absolute inset-y-0 left-0 w-64 bg-white border-r shadow-sm transition-transform duration-200 z-50 flex flex-col ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ borderColor: theme.border }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: theme.border }}>
        <div className="text-base font-semibold">MomFog</div>
        <button className="p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setOpen(false)}>
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* Scrollable menu content */}
      <div className="flex-1 overflow-y-auto">
        {/* People Section */}
        <div className="px-3 py-3 border-b" style={{ borderColor: theme.border }}>
          <Collapsible
            title="People"
            open={peopleOpen}
            onToggle={() => setPeopleOpen(!peopleOpen)}
            icon={<Users size={16} />}
          >
            <div className="space-y-0.5">
              {people.map((person) => (
                <button
                  key={person.id}
                  onClick={() => {
                    onSelectPeople()
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
                >
                  <img src={person.avatar || "/placeholder.svg"} alt={person.name} className="w-6 h-6 rounded-full" />
                  <span className="truncate">{person.name}</span>
                </button>
              ))}
            </div>
          </Collapsible>
        </div>

        {/* Networks Section */}
        <div className="px-3 py-3 border-b" style={{ borderColor: theme.border }}>
          <Collapsible
            title="Networks"
            open={networksOpen}
            onToggle={() => setNetworksOpen(!networksOpen)}
            icon={<Briefcase size={16} />}
          >
            <div className="space-y-0.5">
              {networks.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    onSelectNetwork(n.id)
                    setOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
                >
                  <span className="truncate">{n.name}</span>
                  <span className="text-xs ml-2 flex-shrink-0" style={{ color: theme.subtext }}>
                    {n.members.length}
                  </span>
                </button>
              ))}
            </div>
          </Collapsible>
        </div>

        {/* Ideas Section */}
        <div className="px-3 py-3 border-b" style={{ borderColor: theme.border }}>
          <Collapsible
            title="Ideas"
            open={ideasOpen}
            onToggle={() => setIdeasOpen(!ideasOpen)}
            icon={<Lightbulb size={16} />}
          >
            <div className="space-y-0.5">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                <Lightbulb size={16} style={{ color: theme.subtext }} />
                <span>AI triage for symptom calls</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                <Lightbulb size={16} style={{ color: theme.subtext }} />
                <span>MomFog pilots for clinicians</span>
              </button>
            </div>
          </Collapsible>
        </div>

        {/* Recent Activity Section */}
        <div className="px-3 py-3 border-b" style={{ borderColor: theme.border }}>
          <Collapsible
            title="Recent Activity"
            open={activityOpen}
            onToggle={() => setActivityOpen(!activityOpen)}
            icon={<Clock size={16} />}
          >
            <div className="space-y-0.5">
              <button className="w-full flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                <Clock size={14} className="mt-0.5 flex-shrink-0" style={{ color: theme.subtext }} />
                <div className="text-left">
                  <div className="text-xs" style={{ color: theme.subtext }}>
                    Today
                  </div>
                  <div>Added note to Craig Bunnell</div>
                </div>
              </button>
              <button className="w-full flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                <Clock size={14} className="mt-0.5 flex-shrink-0" style={{ color: theme.subtext }} />
                <div className="text-left">
                  <div className="text-xs" style={{ color: theme.subtext }}>
                    Yesterday
                  </div>
                  <div>Viewed Dana-Farber network</div>
                </div>
              </button>
            </div>
          </Collapsible>
        </div>
      </div>

      {/* User/Account Settings at bottom */}
      <div className="border-t" style={{ borderColor: theme.border }}>
        <div className="px-3 py-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.accent }}
            >
              <User size={16} style={{ color: "white" }} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">My Account</div>
              <div className="text-xs truncate" style={{ color: theme.subtext }}>
                Settings & preferences
              </div>
            </div>
            <Settings size={16} style={{ color: theme.subtext }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Components: Lists, Detail, Knowledge Tree ----------------------------
const PeopleList: React.FC<{
  list: typeof peopleSeed
  onOpen: (id: string) => void
  q: string
  setQ: (s: string) => void
  openMenu: () => void
}> = ({ list, onOpen, q, setQ, openMenu }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All People")

  const filterOptions = ["All People", "Recent", "Favorites", "By Organization"]

  const filtered = useMemo(() => {
    if (!q) return list
    const s = q.toLowerCase()
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.primaryRole || "").toLowerCase().includes(s) ||
        (c.orgs || []).some((o) => o.toLowerCase().includes(s)),
    )
  }, [q, list])

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="px-4 pt-4 pb-3 bg-white border-b sticky top-0 z-10" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={openMenu} className="p-2 rounded-xl hover:bg-gray-100">
            <MenuIcon size={18} />
          </button>
          <div className="relative flex-1">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50"
            >
              <span className="font-semibold text-sm">{selectedFilter}</span>
              <ChevronDown size={16} style={{ color: theme.subtext }} />
            </button>
            {dropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border overflow-hidden z-20"
                style={{ borderColor: theme.border }}
              >
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedFilter(option)
                      setDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${
                      selectedFilter === option ? "bg-gray-100 font-medium" : ""
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border bg-gray-50 flex-1"
            style={{ borderColor: theme.border }}
          >
            <Search size={18} style={{ color: theme.subtext }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search people..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3 pb-20">
        {filtered.map((c) => (
          <Card key={c.id} className="p-4" onClick={() => onOpen(c.id)}>
            <div className="flex items-center gap-3">
              <img src={c.avatar || "/placeholder.svg"} alt={c.name} className="w-12 h-12 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-xs text-gray-500 truncate">{c.primaryRole}</div>
                <div className="mt-1 flex gap-1 flex-wrap">
                  {(c.tags || []).slice(0, 3).map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </div>
              <button className="p-2 rounded-xl hover:bg-gray-100">
                <MoreHorizontal />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

const Notes: React.FC<{ notes: any[] }> = ({ notes }) => (
  <div className="space-y-3">
    {(notes || []).map((n) => (
      <div key={n.id} className="flex gap-3 items-start">
        <div className="w-1.5 h-1.5 mt-2 rounded-full bg-gray-400" />
        <div>
          <div className="text-xs text-gray-500">{new Date(n.date).toLocaleDateString()}</div>
          <div className="text-sm leading-5">{n.text}</div>
          {n.tags?.length ? (
            <div className="flex gap-1 mt-1 flex-wrap">
              {n.tags.map((t: string) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    ))}
  </div>
)

const PersonDetail: React.FC<{
  person: (typeof peopleSeed)[number]
  onBack: () => void
  onOpenPerson: (id: string) => void
}> = ({ person, onBack, onOpenPerson }) => {
  const [tab, setTab] = useState<"details" | "tree">("details")
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white border-b flex items-center gap-3" style={{ borderColor: theme.border }}>
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft />
        </button>
        <img src={person.avatar || "/placeholder.svg"} alt={person.name} className="w-10 h-10 rounded-full" />
        <div className="min-w-0">
          <div className="font-semibold truncate">{person.name}</div>
          <div className="text-xs text-gray-500 truncate">{person.primaryRole}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 bg-white border-b" style={{ borderColor: theme.border }}>
        <div className="inline-flex p-1 rounded-xl bg-gray-100">
          <button
            onClick={() => setTab("details")}
            className={`px-3 py-1.5 text-sm rounded-lg ${tab === "details" ? "bg-white shadow" : ""}`}
          >
            Details
          </button>
          <button
            onClick={() => setTab("tree")}
            className={`px-3 py-1.5 text-sm rounded-lg ${tab === "tree" ? "bg-white shadow" : ""}`}
          >
            Knowledge Tree
          </button>
        </div>
      </div>

      {tab === "details" ? (
        <div className="p-4 space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {person.orgs?.[0] && (
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="opacity-70" />
                  <span>{person.orgs[0]}</span>
                </div>
              )}
              {person.orgs?.[1] && (
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="opacity-70" />
                  <span>{person.orgs[1]}</span>
                </div>
              )}
              {person.coordinates?.home && (
                <div className="flex items-center gap-2">
                  <Home size={14} className="opacity-70" />
                  <span>{person.coordinates.home}</span>
                </div>
              )}
              {person.coordinates?.work && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="opacity-70" />
                  <span>{person.coordinates.work}</span>
                </div>
              )}
            </div>
            {person.tags?.length ? (
              <div className="flex gap-2 flex-wrap mt-3">
                {person.tags.map((t) => (
                  <Chip key={t}>
                    <Tag size={12} className="inline mr-1" />
                    {t}
                  </Chip>
                ))}
              </div>
            ) : null}
          </Card>

          <Card className="p-4">
            <SectionTitle>Notes</SectionTitle>
            <Notes notes={person.notes} />
          </Card>
        </div>
      ) : (
        <KnowledgeTree person={person} onOpenPerson={onOpenPerson} />
      )}

      <div className="h-20" />
    </div>
  )
}

const KnowledgeTree: React.FC<{
  person: (typeof peopleSeed)[number]
  onOpenPerson: (id: string) => void
}> = ({ person, onOpenPerson }) => {
  const byType = useMemo(() => {
    const m = new Map<string, any[]>()
    ;(person.relations || []).forEach((r) => {
      if (!m.has(r.type)) m.set(r.type, [])
      m.get(r.type)!.push(r)
    })
    return Array.from(m.entries())
  }, [person])

  return (
    <div className="p-4">
      <Card className="p-4">
        <div className="flex flex-col items-center">
          <div
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: theme.accent, color: "white" }}
          >
            {person.name}
          </div>
          <div className="text-xs mt-1" style={{ color: theme.subtext }}>
            {person.primaryRole}
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {byType.map(([type, rels]) => (
            <div key={type}>
              <div className="text-xs uppercase tracking-wide mb-2" style={{ color: theme.subtext }}>
                {type}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {rels.map((r, i) => (
                  <button
                    key={i}
                    className="px-3 py-2 rounded-xl border text-left hover:bg-gray-50"
                    style={{ borderColor: theme.border }}
                    onClick={() => onOpenPerson(r.personId)}
                  >
                    <div className="text-sm font-medium">Open related</div>
                    <div className="text-[11px]" style={{ color: theme.subtext }}>
                      {r.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// --- Home (Claude-like prompt + Recent Activity) --------------------------
const HomeView: React.FC<{
  query: string
  setQuery: (s: string) => void
  onSubmit: (e: React.FormEvent) => void
  openMenu: () => void
}> = ({ query, setQuery, onSubmit, openMenu }) => (
  <div className="flex flex-col h-full" style={{ backgroundColor: theme.bg }}>
    {/* Header with menu icon only */}
    <div className="px-4 pt-4 pb-3 flex items-center justify-between">
      <button onClick={openMenu} className="p-2 rounded-xl hover:bg-gray-100">
        <MenuIcon size={20} />
      </button>
      <div className="text-sm font-medium">MomFog</div>
      <div className="w-10" /> {/* Spacer for centering */}
    </div>

    {/* Centered content area */}
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="mb-6">
        <img src="/momfog-logo.png" alt="MomFog Logo" className="w-20 h-20 object-contain" />
      </div>

      {/* Greeting text */}
      <h1 className="text-2xl font-serif text-center mb-12 leading-relaxed" style={{ color: theme.text }}>
        How can I help you this afternoon?
      </h1>
    </div>

    <div className="px-4 pb-6">
      <form onSubmit={onSubmit}>
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-3xl border bg-white shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <button type="button" className="p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
            <Plus size={20} style={{ color: theme.subtext }} />
          </button>
          <button type="button" className="p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
            <Sliders size={20} style={{ color: theme.subtext }} />
          </button>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chat with MomFog"
            className="flex-1 bg-transparent text-sm outline-none min-w-0"
            style={{ color: theme.text }}
          />
          <button type="button" className="p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
            <Mic size={20} style={{ color: theme.subtext }} />
          </button>
          <button
            type="submit"
            className="p-2 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: theme.text }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3 L8 13 M8 3 L5 6 M8 3 L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </form>
    </div>

    {/* Bottom navigation spacing */}
    <div className="h-16" />
  </div>
)

// --- CalendarView component
const CalendarView: React.FC<{ openMenu: () => void }> = ({ openMenu }) => (
  <div className="flex flex-col h-full bg-gray-50">
    <div className="px-4 pt-4 pb-3 bg-white border-b flex items-center gap-3" style={{ borderColor: theme.border }}>
      <button onClick={openMenu} className="p-2 rounded-xl hover:bg-gray-100">
        <MenuIcon size={18} />
      </button>
      <div className="font-semibold text-sm">Calendar</div>
    </div>
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center" style={{ color: theme.subtext }}>
        <Calendar size={48} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">Calendar view coming soon</p>
      </div>
    </div>
    <div className="h-16" />
  </div>
)

// --- PlacesView component
const PlacesView: React.FC<{ openMenu: () => void }> = ({ openMenu }) => (
  <div className="flex flex-col h-full bg-gray-50">
    <div className="px-4 pt-4 pb-3 bg-white border-b flex items-center gap-3" style={{ borderColor: theme.border }}>
      <button onClick={openMenu} className="p-2 rounded-xl hover:bg-gray-100">
        <MenuIcon size={18} />
      </button>
      <div className="font-semibold text-sm">Places</div>
    </div>
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center" style={{ color: theme.subtext }}>
        <MapPin size={48} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">Places view coming soon</p>
      </div>
    </div>
    <div className="h-16" />
  </div>
)

// --- NetworksView component
const NetworksView: React.FC<{
  networks: { id: string; name: string; members: typeof peopleSeed }[]
  onSelectNetwork: (id: string) => void
  openMenu: () => void
}> = ({ networks, onSelectNetwork, openMenu }) => (
  <div className="flex flex-col h-full bg-gray-50">
    <div className="px-4 pt-4 pb-3 bg-white border-b flex items-center gap-3" style={{ borderColor: theme.border }}>
      <button onClick={openMenu} className="p-2 rounded-xl hover:bg-gray-100">
        <MenuIcon size={18} />
      </button>
      <div className="font-semibold text-sm">Networks</div>
    </div>
    <div className="p-4 space-y-3 pb-20">
      {networks.map((network) => (
        <Card key={network.id} className="p-4" onClick={() => onSelectNetwork(network.id)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.accent }}
              >
                <Briefcase size={20} style={{ color: "white" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{network.name}</div>
                <div className="text-xs text-gray-500">
                  {network.members.length} {network.members.length === 1 ? "member" : "members"}
                </div>
              </div>
            </div>
            <button className="p-2 rounded-xl hover:bg-gray-100">
              <MoreHorizontal />
            </button>
          </div>
        </Card>
      ))}
    </div>
  </div>
)

// --- App ------------------------------------------------------------------
export default function MomFogApp() {
  const [query, setQuery] = useState("")
  const [leftOpen, setLeftOpen] = useState(false)
  const [people] = useState(peopleSeed)
  const networks = useMemo(() => buildNetworks(people), [people])

  const [view, setView] = useState<{
    type: "home" | "people" | "network" | "person" | "calendar" | "places" | "networks"
    id?: string
  }>({ type: "home" })
  const openPerson = (id: string) => setView({ type: "person", id })
  const currentPerson = useMemo(() => people.find((c) => c.id === view.id), [people, view])
  const currentNetwork = useMemo(() => networks.find((n) => n.id === view.id), [networks, view])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    // Navigate to people view when user submits
    setView({ type: "people" })
    setQuery("")
  }

  const [peopleSearch, setPeopleSearch] = useState("")

  return (
    <div
      className="flex items-center justify-center w-full h-screen"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <div
        className="relative w-[390px] h-[800px] rounded-[28px] shadow-xl overflow-hidden border"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        {/* Left menu */}
        <LeftMenu
          open={leftOpen}
          setOpen={setLeftOpen}
          onSelectPeople={() => setView({ type: "people" })}
          onSelectNetwork={(id) => setView({ type: "network", id })}
          onSelectNetworks={() => setView({ type: "networks" })}
          networks={networks}
          people={people}
        />

        {/* Main views */}
        {view.type === "home" && (
          <HomeView query={query} setQuery={setQuery} onSubmit={handleSubmit} openMenu={() => setLeftOpen(true)} />
        )}
        {view.type === "people" && (
          <PeopleList
            list={people}
            onOpen={openPerson}
            q={peopleSearch}
            setQ={setPeopleSearch}
            openMenu={() => setLeftOpen(true)}
          />
        )}
        {view.type === "networks" && (
          <NetworksView
            networks={networks}
            onSelectNetwork={(id) => setView({ type: "network", id })}
            openMenu={() => setLeftOpen(true)}
          />
        )}
        {view.type === "calendar" && <CalendarView openMenu={() => setLeftOpen(true)} />}
        {view.type === "places" && <PlacesView openMenu={() => setLeftOpen(true)} />}
        {view.type === "network" && currentNetwork && (
          <div className="flex flex-col min-h-full bg-gray-50">
            <div
              className="px-4 pt-4 pb-3 bg-white border-b flex items-center gap-2"
              style={{ borderColor: theme.border }}
            >
              <button onClick={() => setView({ type: "people" })} className="p-2 rounded-xl hover:bg-gray-100">
                <ArrowLeft />
              </button>
              <div className="text-sm text-gray-500">Network</div>
              <div className="font-semibold">{currentNetwork.name}</div>
            </div>
            <div className="p-4 space-y-3">
              {currentNetwork.members.map((c) => (
                <Card key={c.id} className="p-4" onClick={() => openPerson(c.id)}>
                  <div className="flex items-center gap-3">
                    <img src={c.avatar || "/placeholder.svg"} alt={c.name} className="w-10 h-10 rounded-full" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-gray-500 truncate">{c.primaryRole}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        {view.type === "person" && currentPerson && (
          <PersonDetail
            person={currentPerson}
            onBack={() => setView({ type: "people" })}
            onOpenPerson={(id) => setView({ type: "person", id })}
          />
        )}

        {/* Bottom navigation */}
        <nav className="absolute bottom-0 left-0 right-0 border-t bg-white" style={{ borderColor: theme.border }}>
          <div className="max-w-md mx-auto grid grid-cols-4 text-xs" style={{ color: theme.subtext }}>
            <button className="py-3 flex flex-col items-center gap-1" onClick={() => setView({ type: "home" })}>
              <Home size={18} />
              <span>Home</span>
            </button>
            <button className="py-3 flex flex-col items-center gap-1" onClick={() => setView({ type: "people" })}>
              <Users size={18} />
              <span>People</span>
            </button>
            <button className="py-3 flex flex-col items-center gap-1" onClick={() => setView({ type: "networks" })}>
              <Briefcase size={18} />
              <span>Networks</span>
            </button>
            <button className="py-3 flex flex-col items-center gap-1" onClick={() => setView({ type: "places" })}>
              <MapPin size={18} />
              <span>Places</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}
