"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { usersApi } from "@/api/users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, User, Mail, Lock } from "lucide-react"
import axios from "axios"

const ROLE_OPTIONS = ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER", "FINANCE"] as const
type Role = typeof ROLE_OPTIONS[number]

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000"

/* ─── Inline styles (no Tailwind additions needed) ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .onesync-root {
    font-family: 'DM Sans', sans-serif;
  }

  /* Animated mesh background */
  .auth-bg {
    position: fixed;
    inset: 0;
    background: #f0f4ff;
    overflow: hidden;
    z-index: 0;
  }
  .auth-bg::before {
    content: '';
    position: absolute;
    width: 900px; height: 900px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%);
    top: -20%; left: -15%;
    animation: blob1 14s ease-in-out infinite alternate;
  }
  .auth-bg::after {
    content: '';
    position: absolute;
    width: 700px; height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%);
    bottom: -10%; right: -10%;
    animation: blob2 18s ease-in-out infinite alternate;
  }
  .auth-bg-extra {
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%);
    top: 40%; left: 55%;
    animation: blob3 20s ease-in-out infinite alternate;
  }

  @keyframes blob1 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(60px,40px) scale(1.12)} }
  @keyframes blob2 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(-50px,-30px) scale(1.08)} }
  @keyframes blob3 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(-40px,60px) scale(0.92)} }

  /* Page enter animation */
  .page-enter {
    animation: pageEnter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes pageEnter {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }

  /* Card */
  .auth-card {
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 24px;
    box-shadow:
      0 4px 24px rgba(99,102,241,0.10),
      0 1px 3px rgba(0,0,0,0.06),
      inset 0 1px 0 rgba(255,255,255,0.9);
    transition: box-shadow 0.3s ease;
  }
  .auth-card:hover {
    box-shadow:
      0 8px 40px rgba(99,102,241,0.15),
      0 2px 6px rgba(0,0,0,0.08),
      inset 0 1px 0 rgba(255,255,255,0.9);
  }

  /* Toggle pill */
  .mode-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    background: rgba(241,245,249,0.9);
    border-radius: 14px;
    padding: 4px;
    margin-bottom: 24px;
    border: 1px solid rgba(226,232,240,0.8);
  }
  .mode-btn {
    padding: 10px 0;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    letter-spacing: 0.01em;
  }
  .mode-btn-active {
    background: #fff;
    color: #3b3fce;
    box-shadow: 0 2px 10px rgba(99,102,241,0.18), 0 1px 2px rgba(0,0,0,0.06);
  }
  .mode-btn-inactive {
    background: transparent;
    color: #64748b;
  }
  .mode-btn-inactive:hover { color: #334155; background: rgba(255,255,255,0.5); }

  /* Fields */
  .field-wrap { position: relative; }
  .field-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    pointer-events: none;
    transition: color 0.2s;
  }
  .auth-input {
    width: 100%;
    padding: 11px 14px 11px 42px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.9rem;
    font-family: 'DM Sans', sans-serif;
    background: rgba(255,255,255,0.8);
    color: #1e293b;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .auth-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.14);
    background: #fff;
  }
  .auth-input:focus + .field-icon-overlay,
  .field-wrap:focus-within .field-icon { color: #6366f1; }

  .auth-select {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.9rem;
    font-family: 'DM Sans', sans-serif;
    background: rgba(255,255,255,0.8);
    color: #1e293b;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    cursor: pointer;
  }
  .auth-select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.14);
  }

  /* Form fields slide-in */
  .field-animate {
    animation: fieldIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes fieldIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .field-animate:nth-child(1) { animation-delay: 0.05s; }
  .field-animate:nth-child(2) { animation-delay: 0.10s; }
  .field-animate:nth-child(3) { animation-delay: 0.15s; }
  .field-animate:nth-child(4) { animation-delay: 0.20s; }
  .field-animate:nth-child(5) { animation-delay: 0.25s; }

  /* Submit button */
  .submit-btn {
    width: 100%;
    padding: 13px 0;
    background: linear-gradient(135deg, #4f52e3 0%, #6366f1 60%, #818cf8 100%);
    color: #fff;
    font-weight: 600;
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    letter-spacing: 0.02em;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 4px 16px rgba(99,102,241,0.35);
  }
  .submit-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.4); }
  .submit-btn:hover:not(:disabled)::before { opacity: 1; }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  /* Error */
  .error-box {
    background: rgba(254,242,242,0.9);
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    animation: shakeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes shakeIn {
    0%   { transform: translateX(-6px); opacity:0; }
    40%  { transform: translateX(4px);  opacity:1; }
    70%  { transform: translateX(-2px); }
    100% { transform: translateX(0); }
  }

  /* Credentials box */
  .creds-box {
    margin-top: 20px;
    background: rgba(248,250,252,0.9);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 0.78rem;
    color: #64748b;
    line-height: 1.7;
  }

  /* Branding */
  .brand-logo {
    width: 44px; height: 44px;
    border-radius: 14px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(12px);
    box-shadow: 0 2px 12px rgba(99,102,241,0.18), 0 1px 3px rgba(0,0,0,0.07);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    padding: 6px;
  }
  .brand-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 2rem;
    letter-spacing: -0.04em;
    color: #1e293b;
    line-height: 1;
  }
  .brand-sub {
    font-size: 0.82rem;
    color: #64748b;
    margin-top: 2px;
    font-weight: 400;
  }
  .card-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.55rem;
    color: #1e293b;
    text-align: center;
    letter-spacing: -0.02em;
  }
  .card-desc {
    font-size: 0.875rem;
    color: #64748b;
    text-align: center;
    margin-top: 4px;
  }
  .field-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #475569;
    margin-bottom: 6px;
  }
  .footer-text {
    font-size: 0.75rem;
    color: #94a3b8;
    text-align: center;
    margin-top: 28px;
  }
`

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isLoading, error } = useAuthStore()

  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("admin@onesync.local")
  const [password, setPassword] = useState("admin@123")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<Role>("TEAM_MEMBER")
  const [localError, setLocalError] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)

  const switchMode = (m: "signin" | "signup") => {
    if (m === mode) return
    setMode(m)
    setLocalError(null)
    setFormKey(k => k + 1)
  }

  async function postAuthRedirectAndCache(me: any) {
    localStorage.setItem("me", JSON.stringify(me))
    const userRoleAfterAuth = String(me.role || "").toUpperCase()
    localStorage.setItem("userRole", userRoleAfterAuth)
    navigate(userRoleAfterAuth === "TEAM_MEMBER" ? "/dashboard-team" : "/dashboard")
  }

  async function handleSignIn() {
    setLocalError(null)
    await signIn(email, password)
    const me = (await usersApi.getMe()).data
    await postAuthRedirectAndCache(me)
  }

  async function handleSignUp() {
    setLocalError(null)
    if (!fullName.trim()) { setLocalError("Full name is required"); return }
    if (!ROLE_OPTIONS.includes(role)) { setLocalError("Invalid role"); return }
    const res = await axios.post(`${API_URL}/api/v1/auth/sign-up`, { email, password, fullName, role })
    const { accessToken } = res.data || {}
    if (!accessToken) throw new Error("Sign-up did not return a token")
    localStorage.setItem("token", accessToken)
    const me = (await usersApi.getMe()).data
    await postAuthRedirectAndCache(me)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === "signin") await handleSignIn()
      else await handleSignUp()
    } catch (err: any) {
      setLocalError(err?.response?.data?.message || err?.message || "Something went wrong")
    }
  }

  return (
    <div className="onesync-root" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <style>{css}</style>

      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-bg-extra" />
      </div>

      {/* Content */}
      <div className="page-enter" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "460px" }}>
        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px", justifyContent: "center" }}>
          <div className="brand-logo">
            <img src="/logo.png" alt="OneSync" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
          </div>
          <div>
            <div className="brand-title">OneSync</div>
            <div className="brand-sub">Enterprise workflow automation</div>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card" style={{ padding: "36px 36px 28px" }}>
          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <div className="card-title">
              {mode === "signin" ? "Welcome Back" : "Create your Account"}
            </div>
            <div className="card-desc">
              {mode === "signin"
                ? "Securely access your workspace and projects"
                : "Get started with your free OneSync pilot"}
            </div>
          </div>

          {/* Mode toggle */}
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === "signin" ? "mode-btn-active" : "mode-btn-inactive"}`} onClick={() => switchMode("signin")} type="button">Sign In</button>
            <button className={`mode-btn ${mode === "signup" ? "mode-btn-active" : "mode-btn-inactive"}`} onClick={() => switchMode("signup")} type="button">Sign Up</button>
          </div>

          {/* Error */}
          {(error || localError) && (
            <div className="error-box">
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: "1px" }} />
              <span style={{ fontSize: "0.85rem", color: "#b91c1c" }}>{localError || error}</span>
            </div>
          )}

          {/* Form */}
          <form key={formKey} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mode === "signup" && (
              <>
                <div className="field-animate">
                  <label className="field-label" htmlFor="fullName">Full Name</label>
                  <div className="field-wrap">
                    <User size={15} className="field-icon" />
                    <input id="fullName" className="auth-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" />
                  </div>
                </div>
                <div className="field-animate">
                  <label className="field-label" htmlFor="role">Role</label>
                  <select id="role" className="auth-select" value={role} onChange={e => setRole(e.target.value as Role)}>
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="field-animate">
              <label className="field-label" htmlFor="email">Email</label>
              <div className="field-wrap">
                <Mail size={15} className="field-icon" />
                <input id="email" type="email" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>

            <div className="field-animate">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-wrap">
                <Lock size={15} className="field-icon" />
                <input id="password" type="password" className="auth-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
              </div>
            </div>

            <div className="field-animate" style={{ marginTop: "4px" }}>
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading
                  ? (mode === "signin" ? "Signing in…" : "Creating account…")
                  : (mode === "signin" ? "Sign In" : "Sign Up")}
              </button>
            </div>
          </form>

          {/* Demo credentials */}
          <div className="creds-box">
            <div style={{ fontWeight: 600, color: "#475569", marginBottom: "4px", fontSize: "0.8rem" }}>Test Credentials</div>
            <div>Admin: admin@onesync.local / admin@123</div>
            <div>PM: pm@onesync.local / pm@123</div>
            <div>Finance: finance@onesync.local / finance@123</div>
            <div>Team: team@onesync.local / team@123</div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer-text">
          © 2025 <strong style={{ color: "#475569" }}>OneSync</strong>. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default LoginPage