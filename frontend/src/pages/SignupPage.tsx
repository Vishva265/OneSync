"use client"

import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { usersApi } from "@/api/users"
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, User } from "lucide-react"
import axios from "axios"

const ROLE_OPTIONS = ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER", "FINANCE"] as const
type Role = typeof ROLE_OPTIONS[number]

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000"

const authStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");

  .signup-shell {
    --navy: #0f2a52;
    --primary: #1a3c6e;
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

  .signup-shell *,
  .signup-shell *::before,
  .signup-shell *::after {
    box-sizing: border-box;
  }

  .signup-card,
  .signup-side-card {
    background: var(--surface);
    border: 0.5px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .signup-label {
    display: block;
    margin-bottom: 4px;
    color: var(--secondary);
    font-size: 12px;
    font-weight: 500;
  }

  .signup-input-wrap {
    position: relative;
  }

  .signup-field-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--tertiary);
    pointer-events: none;
  }

  .signup-input,
  .signup-select {
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

  .signup-input {
    padding: 0 14px 0 42px;
  }

  .signup-select {
    padding: 0 14px;
    cursor: pointer;
  }

  .signup-input:focus,
  .signup-select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(26,60,110,0.12);
  }

  .signup-input-wrap:focus-within .signup-field-icon {
    color: var(--primary);
  }

  .signup-btn-primary,
  .signup-btn-secondary {
    height: 40px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 150ms ease, border-color 150ms ease;
  }

  .signup-btn-primary {
    background: var(--primary);
    color: #fff;
  }

  .signup-btn-primary:hover:not(:disabled) {
    background: #15325d;
  }

  .signup-btn-secondary {
    border: 1.5px solid var(--primary);
    background: transparent;
    color: var(--primary);
  }

  .signup-btn-secondary:hover {
    background: rgba(26,60,110,0.08);
  }

  .signup-error {
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

  .signup-enter {
    animation: signupEnter 360ms ease-out both;
  }

  @keyframes signupEnter {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .signup-enter {
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

export function SignupPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("TEAM_MEMBER")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function postAuthRedirectAndCache(me: any) {
    localStorage.setItem("me", JSON.stringify(me))
    const userRoleAfterAuth = String(me.role || "").toUpperCase()
    localStorage.setItem("userRole", userRoleAfterAuth)
    navigate(userRoleAfterAuth === "TEAM_MEMBER" ? "/dashboard-team" : "/dashboard")
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError("Full name is required")
      return
    }

    setIsLoading(true)
    try {
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
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-shell">
      <style>{authStyles}</style>

      <main className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_460px] lg:px-8">
        <section className="hidden lg:flex lg:flex-col lg:justify-center">
          <button type="button" onClick={() => navigate("/")} className="mb-8 flex items-center gap-3">
            <img src="/logo.png" alt="OneSync" className="h-9 w-9 rounded-md object-cover" />
            <span className="text-xl font-semibold text-[#0f172a]">OneSync</span>
          </button>

          <div className="signup-side-card signup-enter p-8">
            <div className="mb-4 inline-flex rounded bg-[#eff6ff] px-2 py-1 text-xs text-[#1a3c6e]" style={{ border: "0.5px solid #bfdbfe" }}>
              Workspace setup
            </div>
            <h1 className="max-w-xl text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#0f172a]">
              Create access for project delivery and finance work.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-[1.6] text-[#64748b]">
              Add your profile, choose a role, and continue into a workspace built around projects, timesheets,
              expenses, and billing records.
            </p>

            <div className="mt-8 grid gap-3">
              {["Role-aware dashboards", "Approval queues", "Finance-ready project records"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                  <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                  <span className="text-sm text-[#0f172a]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-[460px]">
            <button type="button" onClick={() => navigate("/")} className="signup-enter mb-6 flex items-center gap-3 lg:hidden">
              <img src="/logo.png" alt="OneSync" className="h-9 w-9 rounded-md object-cover" />
              <span className="text-xl font-semibold text-[#0f172a]">OneSync</span>
            </button>

            <div className="signup-card signup-enter p-6 sm:p-8">
              <div className="mb-6">
                <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">
                  Create account
                </div>
                <h2 className="mt-2 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#0f172a]">
                  Start with OneSync
                </h2>
                <p className="mt-2 text-sm leading-[1.6] text-[#64748b]">
                  Set up your access and continue into the workspace.
                </p>
              </div>

              {error && (
                <div className="signup-error mb-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="signup-label" htmlFor="fullName">
                    Full name
                  </label>
                  <div className="signup-input-wrap">
                    <input
                      id="fullName"
                      className="signup-input"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Jane Doe"
                    />
                    <User className="signup-field-icon h-4 w-4" />
                  </div>
                </div>

                <div>
                  <label className="signup-label" htmlFor="email">
                    Email
                  </label>
                  <div className="signup-input-wrap">
                    <input
                      id="email"
                      type="email"
                      className="signup-input"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                    />
                    <Mail className="signup-field-icon h-4 w-4" />
                  </div>
                </div>

                <div>
                  <label className="signup-label" htmlFor="password">
                    Password
                  </label>
                  <div className="signup-input-wrap">
                    <input
                      id="password"
                      type="password"
                      className="signup-input"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                    />
                    <Lock className="signup-field-icon h-4 w-4" />
                  </div>
                </div>

                <div>
                  <label className="signup-label" htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    className="signup-select"
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

                <button
                  type="submit"
                  className="signup-btn-primary inline-flex w-full items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  className="signup-btn-secondary inline-flex w-full items-center justify-center gap-2"
                  onClick={() => navigate("/login")}
                >
                  Already have an account? Sign in
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default SignupPage
