"use client"

import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { usersApi } from "@/api/users"
import { useAuthStore } from "@/store/auth"
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react"
import axios from "axios"

const ROLE_OPTIONS = ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER", "FINANCE"] as const
type Role = typeof ROLE_OPTIONS[number]

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000"

const authStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");

  .auth-shell {
    --navy: #0f2a52;
    --primary: #1a3c6e;
    --accent: #2563eb;
    --page: #f0f4fa;
    --surface: #ffffff;
    --muted: #f8fafc;
    --border: #e2e8f0;
    --border-strong: #d1d5db;
    --text: #0f172a;
    --secondary: #64748b;
    --tertiary: #94a3b8;
    min-height: 100vh;
    background: var(--page);
    color: var(--text);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .auth-shell *,
  .auth-shell *::before,
  .auth-shell *::after {
    box-sizing: border-box;
  }

  .auth-card,
  .auth-panel,
  .auth-mini-card {
    background: var(--surface);
    border: 0.5px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .auth-panel {
    background: #0f2a52;
    color: #fff;
  }

  .auth-doodle {
    position: absolute;
    right: 24px;
    top: 36px;
    width: 240px;
    height: 190px;
    opacity: 0.42;
    pointer-events: none;
  }

  .auth-doodle svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .auth-label {
    display: block;
    margin-bottom: 4px;
    color: var(--secondary);
    font-size: 12px;
    font-weight: 500;
  }

  .auth-input-wrap {
    position: relative;
  }

  .auth-field-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--tertiary);
    pointer-events: none;
  }

  .auth-input,
  .auth-select {
    width: 100%;
    height: 40px;
    border: 1.5px solid var(--border-strong);
    border-radius: 8px;
    background: #fff;
    color: var(--text);
    font: inherit;
    font-size: 14px;
    outline: none;
    transition: border-color 150ms ease, box-shadow 150ms ease;
  }

  .auth-input {
    padding: 0 14px 0 42px;
  }

  .auth-select {
    padding: 0 14px;
    cursor: pointer;
  }

  .auth-input:focus,
  .auth-select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(26,60,110,0.12);
  }

  .auth-input:focus + .auth-field-icon,
  .auth-input-wrap:focus-within .auth-field-icon {
    color: var(--primary);
  }

  .auth-btn-primary,
  .auth-btn-secondary,
  .auth-btn-tab {
    height: 40px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .auth-btn-primary {
    background: var(--primary);
    color: #fff;
  }

  .auth-btn-primary:hover:not(:disabled) {
    background: #15325d;
  }

  .auth-btn-secondary {
    border: 1.5px solid var(--primary);
    background: transparent;
    color: var(--primary);
  }

  .auth-btn-secondary:hover {
    background: rgba(26,60,110,0.08);
  }

  .auth-btn-tab {
    color: var(--secondary);
    background: transparent;
  }

  .auth-btn-tab-active {
    background: #fff;
    color: var(--primary);
    border: 0.5px solid var(--border);
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .auth-error {
    display: flex;
    gap: 10px;
    border: 0.5px solid #fecaca;
    border-radius: 8px;
    background: #fee2e2;
    color: #b91c1c;
    padding: 12px;
    font-size: 13px;
    line-height: 1.5;
  }

  .auth-enter {
    animation: authEnter 360ms ease-out both;
  }

  @keyframes authEnter {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .auth-enter {
      animation: none;
    }
  }
`

const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project manager",
  TEAM_MEMBER: "Team member",
  FINANCE: "Finance",
}

const authBenefits: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Role-aware dashboards", icon: ShieldCheck },
  { label: "Project and finance workflows", icon: BriefcaseBusiness },
  { label: "Approval queues without spreadsheet cleanup", icon: CheckCircle2 },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isLoading, error, clearError } = useAuthStore()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("admin@onesync.local")
  const [password, setPassword] = useState("admin@123")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<Role>("TEAM_MEMBER")
  const [localError, setLocalError] = useState<string | null>(null)

  const switchMode = (nextMode: "signin" | "signup") => {
    setMode(nextMode)
    setLocalError(null)
    clearError()
    if (nextMode === "signup") {
      setEmail("")
      setPassword("")
    } else {
      setEmail("admin@onesync.local")
      setPassword("admin@123")
    }
  }

  async function postAuthRedirectAndCache(me: any) {
    localStorage.setItem("me", JSON.stringify(me))
    const userRoleAfterAuth = String(me.role || "").toUpperCase()
    localStorage.setItem("userRole", userRoleAfterAuth)
    navigate(userRoleAfterAuth === "TEAM_MEMBER" ? "/dashboard-team" : "/dashboard")
  }

  async function handleSignIn() {
    await signIn(email, password)
    const me = (await usersApi.getMe()).data
    await postAuthRedirectAndCache(me)
  }

  async function handleSignUp() {
    if (!fullName.trim()) {
      setLocalError("Full name is required")
      return
    }

    const response = await axios.post(`${API_URL}/api/v1/auth/sign-up`, {
      email,
      password,
      fullName,
      role,
    })
    const { accessToken } = response.data || {}
    if (!accessToken) throw new Error("Sign-up did not return a token")

    localStorage.setItem("token", accessToken)
    const me = (await usersApi.getMe()).data
    await postAuthRedirectAndCache(me)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLocalError(null)
    clearError()

    try {
      if (mode === "signin") await handleSignIn()
      else await handleSignUp()
    } catch (err: any) {
      setLocalError(err?.response?.data?.message || err?.message || "Something went wrong")
    }
  }

  return (
    <div className="auth-shell">
      <style>{authStyles}</style>

      <main className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="auth-panel auth-enter relative hidden overflow-hidden p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="relative z-10">
            <button type="button" onClick={() => navigate("/")} className="mb-12 flex items-center gap-3">
              <img src="/logo.png" alt="OneSync" className="h-9 w-9 rounded-md object-cover" />
              <span className="text-[20px] font-semibold">OneSync</span>
            </button>

            <div className="max-w-xl">
              <div className="mb-4 inline-flex rounded bg-white/10 px-2 py-1 text-xs text-white/80">
                Secure workspace access
              </div>
              <h1 className="text-[26px] font-semibold leading-[1.3] tracking-[-0.02em]">
                Project delivery, approvals, and finance in one place.
              </h1>
              <p className="mt-4 text-sm leading-[1.6] text-white/70">
                Sign in to manage tasks, timesheets, expenses, invoices, and role-aware dashboards with a clean
                operational record.
              </p>
            </div>

            <div className="mt-8 grid gap-3">
              {authBenefits.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <Icon className="h-4 w-4 text-white" />
                  <span className="text-sm text-white/85">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-doodle" aria-hidden="true">
            <svg viewBox="0 0 240 190" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M36 146C58 88 93 58 168 43"
                stroke="#bfdbfe"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="6 8"
              />
              <path
                d="M66 47C98 20 144 18 182 47C218 75 220 125 191 151"
                stroke="rgba(255,255,255,0.34)"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <rect x="18" y="116" width="84" height="48" rx="10" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.26)" />
              <rect x="34" y="132" width="38" height="6" rx="3" fill="rgba(255,255,255,0.58)" />
              <rect x="34" y="144" width="52" height="6" rx="3" fill="rgba(255,255,255,0.28)" />
              <rect x="128" y="20" width="82" height="54" rx="10" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.26)" />
              <rect x="144" y="37" width="44" height="6" rx="3" fill="rgba(255,255,255,0.58)" />
              <rect x="144" y="50" width="32" height="6" rx="3" fill="rgba(255,255,255,0.28)" />
              <rect x="126" y="124" width="90" height="42" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.22)" />
              <rect x="143" y="140" width="54" height="6" rx="3" fill="rgba(255,255,255,0.45)" />
              <circle cx="36" cy="146" r="6" fill="#93c5fd" />
              <circle cx="168" cy="43" r="6" fill="#bfdbfe" />
              <circle cx="126" cy="124" r="5" fill="rgba(147,197,253,0.72)" />
              <circle cx="96" cy="88" r="18" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.16)" />
              <path
                d="M88 88L94 94L106 80"
                stroke="rgba(255,255,255,0.72)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            {[
              ["24", "Projects"],
              ["186", "Hours pending"],
              ["$42k", "Ready to invoice"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-[26px] font-semibold leading-[1.3]">{value}</div>
                <div className="mt-1 text-xs text-white/60">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-[440px]">
            <button type="button" onClick={() => navigate("/")} className="auth-enter mb-6 flex items-center gap-3 lg:hidden">
              <img src="/logo.png" alt="OneSync" className="h-9 w-9 rounded-md object-cover" />
              <span className="text-xl font-semibold text-[#0f172a]">OneSync</span>
            </button>

            <div className="auth-card auth-enter p-6 sm:p-8">
              <div className="mb-6">
                <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">
                  {mode === "signin" ? "Welcome back" : "Create workspace access"}
                </div>
                <h2 className="mt-2 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#0f172a]">
                  {mode === "signin" ? "Sign in to OneSync" : "Create your account"}
                </h2>
                <p className="mt-2 text-sm leading-[1.6] text-[#64748b]">
                  {mode === "signin"
                    ? "Access your project operations workspace."
                    : "Set up a user profile for your workspace."}
                </p>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-[#f8fafc] p-1">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`auth-btn-tab ${mode === "signin" ? "auth-btn-tab-active" : ""}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`auth-btn-tab ${mode === "signup" ? "auth-btn-tab-active" : ""}`}
                >
                  Sign up
                </button>
              </div>

              {(error || localError) && (
                <div className="auth-error mb-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{localError || error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <>
                    <div>
                      <label className="auth-label" htmlFor="fullName">
                        Full name
                      </label>
                      <div className="auth-input-wrap">
                        <input
                          id="fullName"
                          className="auth-input"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          placeholder="Jane Doe"
                        />
                        <User className="auth-field-icon h-4 w-4" />
                      </div>
                    </div>

                    <div>
                      <label className="auth-label" htmlFor="role">
                        Role
                      </label>
                      <select
                        id="role"
                        className="auth-select"
                        value={role}
                        onChange={(event) => setRole(event.target.value as Role)}
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {roleLabels[option]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="auth-label" htmlFor="email">
                    Email
                  </label>
                  <div className="auth-input-wrap">
                    <input
                      id="email"
                      type="email"
                      className="auth-input"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                    />
                    <Mail className="auth-field-icon h-4 w-4" />
                  </div>
                </div>

                <div>
                  <label className="auth-label" htmlFor="password">
                    Password
                  </label>
                  <div className="auth-input-wrap">
                    <input
                      id="password"
                      type="password"
                      className="auth-input"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                    />
                    <Lock className="auth-field-icon h-4 w-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary inline-flex w-full items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (mode === "signin" ? "Signing in..." : "Creating account...") : mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {mode === "signin" && (
                <div className="auth-mini-card mt-5 bg-[#f8fafc] p-4">
                  <div className="mb-2 text-xs font-medium text-[#0f172a]">Test credentials</div>
                  <div className="grid gap-1 text-xs leading-[1.6] text-[#64748b]">
                    <span>Admin: admin@onesync.local / admin@123</span>
                    <span>PM: pm@onesync.local / pm@123</span>
                    <span>Finance: finance@onesync.local / finance@123</span>
                    <span>Team: team@onesync.local / team@123</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LoginPage
