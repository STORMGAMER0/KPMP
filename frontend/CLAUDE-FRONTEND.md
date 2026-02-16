# CLAUDE.md — KPDF Frontend (React)

## Project Overview

This is the React frontend for the KPDF mentorship platform. The UI was initially prototyped in Figma Make and exported as React components. Claude Code's job is to integrate these exported components into a production-ready app that communicates with the FastAPI backend.

**Stack:** React 18 · TypeScript · React Router v6 · Axios · TanStack Query (React Query) · Zustand (state) · Tailwind CSS

---

## The Figma Make Integration Workflow

Figma Make exports a `.zip` containing React components with inline mock data and local state. These components look good but are non-functional — they don't talk to a backend, don't handle real auth, and have hardcoded data.

### Integration Process

For every Figma Make export:

```
1. Extract the .zip into /src/figma-imports/<screen-name>/
2. Identify which components are purely visual (keep as-is)
3. Identify which components need real data (refactor)
4. Extract mock data → replace with API calls via hooks
5. Connect to app routing, auth context, and global state
6. Delete the figma-imports copy once integrated
```

### What to Keep From Figma Exports

- **Layout structure** — the HTML/JSX structure and CSS/styling
- **Component decomposition** — how the UI is split into components
- **Visual design** — colors, spacing, typography, icons
- **Responsive behavior** — any media queries or responsive logic

### What to Replace

- **Hardcoded mock data** → API calls via custom hooks
- **Local `useState` for server data** → TanStack Query
- **Inline click handlers with `alert()`** → real navigation and API mutations
- **Any `fetch()` or simulated API calls** → Axios instance with interceptors
- **Inline auth checks** → route guards and auth context
- **File-scoped CSS or styled-components** → Tailwind utility classes (if not already)

---

## Frontend File Structure

```
src/
├── main.tsx                      # App entry, providers, router mount
├── App.tsx                       # Router definition
│
├── api/                          # API layer (Axios + endpoint functions)
│   ├── client.ts                 # Axios instance with base URL, interceptors, token
│   ├── auth.ts                   # login(), changePassword()
│   ├── mentees.ts                # getMe(), updateProfilePicture()
│   ├── sessions.ts               # getNextSession(), adminGetSessions(), createSession()
│   ├── attendance.ts             # joinSession(), submitCode(), generateCode(), getAttendance()
│   ├── telegram.ts               # getUnmappedUsers(), mapUser()
│   └── leaderboard.ts            # getLeaderboard(), getDashboardStats()
│
├── hooks/                        # Custom React hooks (data fetching + mutations)
│   ├── useAuth.ts                # Login, logout, current user, token management
│   ├── useMentee.ts              # useMe(), useUpdateProfile()
│   ├── useSessions.ts            # useNextSession(), useSessions(), useCreateSession()
│   ├── useAttendance.ts          # useJoinSession(), useSubmitCode(), useGenerateCode()
│   ├── useTelegram.ts            # useUnmappedUsers(), useMapUser()
│   └── useLeaderboard.ts         # useLeaderboard(), useDashboardStats()
│
├── stores/                       # Zustand stores (client-only state)
│   └── authStore.ts              # token, user, role, isAuthenticated, login(), logout()
│
├── contexts/                     # React contexts (if needed beyond Zustand)
│   └── AuthProvider.tsx          # Wraps app, checks token on mount, provides user
│
├── components/                   # Shared/reusable UI components
│   ├── ui/                       # Generic: Button, Input, Modal, Badge, Card, Table, Spinner
│   ├── layout/                   # Sidebar, TopBar, MenteeLayout, AdminLayout, BottomNav
│   └── guards/                   # ProtectedRoute, MenteeRoute, CoordinatorRoute
│
├── pages/                        # Page-level components (one per route)
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ChangePasswordPage.tsx
│   ├── mentee/
│   │   ├── DashboardPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── LiveSessionPage.tsx
│   └── admin/
│       ├── DashboardPage.tsx
│       ├── SessionsPage.tsx
│       ├── SessionDetailPage.tsx
│       ├── MenteesPage.tsx
│       ├── MenteeDetailPage.tsx
│       ├── AttendancePage.tsx
│       ├── LeaderboardPage.tsx
│       └── TelegramMappingPage.tsx
│
├── figma-imports/                # TEMPORARY — raw Figma Make exports land here
│   └── (delete after integration)
│
├── types/                        # TypeScript interfaces/types
│   ├── auth.ts
│   ├── mentee.ts
│   ├── session.ts
│   ├── attendance.ts
│   ├── telegram.ts
│   └── leaderboard.ts
│
└── lib/                          # Utility functions
    ├── formatDate.ts
    ├── formatScore.ts
    └── constants.ts              # API base URL, role enums, route paths
```

---

## How to Integrate a Figma Make Export — Step by Step

### Example: Integrating the Mentee Dashboard

**Starting point:** Figma exports a `Dashboard.tsx` with hardcoded session data, a fake countdown, and static attendance numbers.

#### Step 1: Place the export

```
src/figma-imports/mentee-dashboard/
├── Dashboard.tsx        # Main component
├── SessionCard.tsx      # Next session card
├── CountdownTimer.tsx   # Countdown component
└── styles.css           # Any exported styles
```

#### Step 2: Define the TypeScript types

```typescript
// src/types/session.ts
export interface Session {
  id: number;
  title: string;
  description: string;
  start_time: string;     // ISO datetime
  end_time: string;
  google_meet_link: string;
  is_core_session: boolean;
  speaker_name: string | null;
  speaker_bio: string | null;
  speaker_linkedin_url: string | null;
  materials: SessionMaterial[];
}

export interface SessionMaterial {
  id: number;
  title: string;
  file_url: string;
  file_type: string | null;
}
```

#### Step 3: Create the API function

```typescript
// src/api/sessions.ts
import { client } from "./client";
import type { Session } from "@/types/session";

export async function getNextSession(): Promise<Session> {
  const { data } = await client.get("/sessions/next");
  return data;
}
```

#### Step 4: Create the data-fetching hook

```typescript
// src/hooks/useSessions.ts
import { useQuery } from "@tanstack/react-query";
import { getNextSession } from "@/api/sessions";

export function useNextSession() {
  return useQuery({
    queryKey: ["sessions", "next"],
    queryFn: getNextSession,
    staleTime: 60_000,  // 1 minute
  });
}
```

#### Step 5: Refactor the Figma component

Take the visual structure from the Figma export. Replace hardcoded data with the hook.

```tsx
// src/pages/mentee/DashboardPage.tsx
import { useNextSession } from "@/hooks/useSessions";
import { useAuth } from "@/hooks/useAuth";
import { SessionCard } from "@/components/mentee/SessionCard";
import { Spinner } from "@/components/ui/Spinner";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: session, isLoading, error } = useNextSession();

  if (isLoading) return <Spinner />;
  if (error) return <p>Failed to load session.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Keep the Figma layout and styling */}
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome, {user?.full_name}
      </h1>

      {session ? (
        <SessionCard session={session} />
      ) : (
        <p className="text-slate-500 mt-4">No upcoming sessions.</p>
      )}
    </div>
  );
}
```

```tsx
// src/components/mentee/SessionCard.tsx
// Visual structure from Figma export, but data from props
import type { Session } from "@/types/session";
import { CountdownTimer } from "./CountdownTimer";
import { Link } from "react-router-dom";

interface Props {
  session: Session;
}

export function SessionCard({ session }: Props) {
  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold">{session.title}</h2>
      <p className="text-slate-500 mt-1">
        {formatDate(session.start_time)} · {formatTime(session.start_time)} - {formatTime(session.end_time)}
      </p>

      <CountdownTimer targetTime={session.start_time} />

      {session.speaker_name && (
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100" />
          <div>
            <p className="font-medium">{session.speaker_name}</p>
            {session.speaker_linkedin_url && (
              <a
                href={session.speaker_linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      )}

      <Link
        to="/session/live"
        className="mt-4 inline-block bg-blue-700 text-white px-6 py-2 rounded-lg"
      >
        View Session Details
      </Link>
    </div>
  );
}
```

#### Step 6: Delete the figma-import

Once the page is integrated and working, delete `src/figma-imports/mentee-dashboard/`.

---

## API Client Setup

```typescript
// src/api/client.ts
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — logout and redirect
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## Auth Store (Zustand)

```typescript
// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: {
    id: number;
    email: string;
    role: "MENTEE" | "COORDINATOR";
    full_name: string;
    mentee_id?: string;
    must_reset_password: boolean;
  } | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: "kpdf-auth" }
  )
);
```

---

## Route Guards

```tsx
// src/components/guards/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.must_reset_password) return <Navigate to="/change-password" replace />;

  return <Outlet />;
}

export function MenteeRoute() {
  const { user } = useAuthStore();
  if (user?.role !== "MENTEE") return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function CoordinatorRoute() {
  const { user } = useAuthStore();
  if (user?.role !== "COORDINATOR") return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}
```

---

## Router Setup

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, MenteeRoute, CoordinatorRoute } from "@/components/guards";
import { MenteeLayout } from "@/components/layout/MenteeLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import ChangePasswordPage from "@/pages/auth/ChangePasswordPage";
import MenteeDashboard from "@/pages/mentee/DashboardPage";
import MenteeProfile from "@/pages/mentee/ProfilePage";
import LiveSession from "@/pages/mentee/LiveSessionPage";
import AdminDashboard from "@/pages/admin/DashboardPage";
import AdminSessions from "@/pages/admin/SessionsPage";
import AdminMentees from "@/pages/admin/MenteesPage";
import AdminMenteeDetail from "@/pages/admin/MenteeDetailPage";
import AdminAttendance from "@/pages/admin/AttendancePage";
import AdminLeaderboard from "@/pages/admin/LeaderboardPage";
import AdminTelegramMapping from "@/pages/admin/TelegramMappingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Mentee routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MenteeRoute />}>
            <Route element={<MenteeLayout />}>
              <Route path="/dashboard" element={<MenteeDashboard />} />
              <Route path="/profile" element={<MenteeProfile />} />
              <Route path="/session/live" element={<LiveSession />} />
            </Route>
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<CoordinatorRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/sessions" element={<AdminSessions />} />
              <Route path="/admin/sessions/:id/attendance" element={<AdminAttendance />} />
              <Route path="/admin/mentees" element={<AdminMentees />} />
              <Route path="/admin/mentees/:id" element={<AdminMenteeDetail />} />
              <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
              <Route path="/admin/telegram-mapping" element={<AdminTelegramMapping />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Data Fetching Pattern — The Standard

Every page that shows server data follows this exact pattern:

```
1. API function (src/api/)         → Makes the HTTP request
2. Custom hook (src/hooks/)        → Wraps API call in useQuery/useMutation
3. Page component (src/pages/)     → Calls hook, handles loading/error/success states
4. Presentational component        → Receives data as props, renders UI
```

### Queries (reading data)

```typescript
// Hook
export function useLeaderboard(track: string | null) {
  return useQuery({
    queryKey: ["leaderboard", track],
    queryFn: () => getLeaderboard(track),
    enabled: track !== null,
  });
}

// Page
export default function LeaderboardPage() {
  const [track, setTrack] = useState<string>("Backend Engineering");
  const { data, isLoading } = useLeaderboard(track);

  return (
    <div>
      <TrackSelector value={track} onChange={setTrack} />
      {isLoading ? <Spinner /> : <LeaderboardTable entries={data ?? []} />}
    </div>
  );
}
```

### Mutations (writing data)

```typescript
// Hook
export function useJoinSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => joinSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

// In component
const joinMutation = useJoinSession();

<button
  onClick={() => joinMutation.mutate(session.id)}
  disabled={joinMutation.isPending}
>
  {joinMutation.isPending ? "Joining..." : "Join Live Session"}
</button>
```

---

## Attendance Code — Live Session Page Pattern

This is the most complex mentee-facing page. Here's how the pieces connect:

```tsx
// src/pages/mentee/LiveSessionPage.tsx
export default function LiveSessionPage() {
  const { data: session } = useNextSession();
  const joinMutation = useJoinSession();
  const submitCodeMutation = useSubmitCode();
  const [code, setCode] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = () => {
    if (!session) return;
    joinMutation.mutate(session.id, {
      onSuccess: () => {
        setHasJoined(true);
        // Open Google Meet in new tab
        window.open(session.google_meet_link, "_blank");
      },
    });
  };

  const handleSubmitCode = () => {
    if (!session) return;
    submitCodeMutation.mutate(
      { sessionId: session.id, code },
      {
        onSuccess: () => {
          // Show success state
        },
      }
    );
  };

  // ... render with Figma-exported visual structure
}
```

---

## Rules for Claude Code

### When integrating a Figma export:

1. **Never rewrite the visual design.** Keep the Figma layout, colors, spacing, and component hierarchy. Your job is to connect data, not redesign.
2. **Extract mock data into types.** Look at the hardcoded arrays/objects in the Figma code. Create TypeScript interfaces that match the shape, then match those to the backend API response.
3. **One API function per backend endpoint.** Don't combine multiple endpoints into one function.
4. **One custom hook per data concern.** `useNextSession`, `useLeaderboard`, `useAttendance` — not a god hook.
5. **Loading and error states on every page.** Figma exports won't have these. Add a `<Spinner />` for loading and an error message for failures.
6. **Empty states.** If the API returns an empty list, show a helpful message, not a blank screen.
7. **Never store server data in Zustand.** Server state goes in TanStack Query. Zustand is only for client state (auth, UI preferences, sidebar open/closed).

### TypeScript rules:

- **No `any`.** If the type is genuinely unknown, use `unknown` and narrow it.
- **Interface for object shapes, type for unions and computed types.**
- **All API response types must match the backend Pydantic response schemas exactly.** If the backend returns `meet_score: float`, the frontend type is `meet_score: number`.
- **Optional fields use `| null`, not `?`** for API responses (backend sends explicit null, not undefined).

### Component rules:

- **Pages** fetch data (via hooks) and handle state. They are in `src/pages/`.
- **Components** receive data as props and render UI. They are in `src/components/`.
- **A component should never call `useQuery` or `useMutation` directly.** Data fetching happens in pages or in custom hooks used by pages.
- **Keep components under 150 lines.** If longer, decompose.
- **All event handlers in pages, not in presentational components.** Pass callbacks as props.

### Styling rules:

- **Tailwind utility classes** for all styling. No CSS files, no CSS modules, no styled-components.
- **If Figma exports CSS files,** convert them to Tailwind classes during integration.
- **Use design tokens consistently:**
  - Primary: `blue-800` (#1B4F72)
  - Accent: `blue-600` (#2E86C1)
  - Background: `white`, `slate-50`
  - Text: `slate-900` (primary), `slate-500` (secondary)
  - Success: `green-600`, Warning: `yellow-500`, Error: `red-600`
- **Responsive breakpoints:** Mobile-first for mentee pages. Desktop-first for admin pages. Use `sm:`, `md:`, `lg:` prefixes.

---

## Prompt Template for Claude Code

When you want Claude Code to integrate a specific Figma export, use this prompt structure:

```
I have a Figma Make export for [SCREEN NAME] in src/figma-imports/[folder]/.

The backend endpoint is:
- [METHOD] [ENDPOINT] → returns [RESPONSE SHAPE]

Please:
1. Create the TypeScript types in src/types/
2. Create the API function in src/api/
3. Create the custom hook in src/hooks/
4. Refactor the Figma component into src/pages/ and src/components/
5. Replace all hardcoded data with the hook
6. Add loading, error, and empty states
7. Connect navigation (React Router links/redirects)
8. Ensure the page is behind the correct route guard

Follow the patterns in CLAUDE.md. Keep the Figma visual design intact.
```

---

## Common Integration Pitfalls

1. **Figma exports use `onClick={() => alert("...")}`.** Replace every one with real navigation or API calls.
2. **Figma exports might use `<a href>` for navigation.** Replace with React Router `<Link to>` or `useNavigate()`.
3. **Figma exports have no error boundaries.** Wrap page-level components in error boundaries.
4. **Figma countdown timers use `setInterval` without cleanup.** Always return a cleanup function from `useEffect`.
5. **Figma exports may inline SVG icons.** Extract to a shared `components/icons/` folder or use `lucide-react`.
6. **The admin sidebar will be duplicated across exports.** Create one `AdminLayout` with `<Outlet />` and reuse it. Don't duplicate sidebar code per page.
7. **Attendance code input needs real-time feedback.** After submitting, show success/error inline. Don't use `alert()`.
8. **Google Meet link must open in new tab.** Always use `window.open(url, "_blank")`, never `window.location.href`.
