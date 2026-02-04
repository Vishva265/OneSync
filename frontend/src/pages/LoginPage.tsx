"use client"

import { useState } from "react"
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

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isLoading, error } = useAuthStore()

  const [mode, setMode] = useState<"signin" | "signup">("signin")

  const [email, setEmail] = useState("admin@oneflow.local")
  const [password, setPassword] = useState("admin@123")

  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<Role>("TEAM_MEMBER")

  const [localError, setLocalError] = useState<string | null>(null)

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
    if (!fullName.trim()) {
      setLocalError("Full name is required")
      return
    }
    if (!ROLE_OPTIONS.includes(role)) {
      setLocalError("Invalid role")
      return
    }

    const res = await axios.post(`${API_URL}/api/v1/auth/sign-up`, {
      email,
      password,
      fullName,
      role,
    })

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
      console.error(err)
      setLocalError(err?.response?.data?.message || err?.message || "Something went wrong")
    }
  }

  return (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
    {/* Branding */}
    <div className="flex items-center gap-2 mb-8">
      <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
            />
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">OneFlow</h1>
    </div>

    {/* Auth Card */}
    <Card className="w-full max-w-md bg-white shadow-xl rounded-xl border border-gray-100">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {mode === "signin" ? "Welcome Back 👋" : "Create an Account"}
        </CardTitle>
        <CardDescription className="text-black mt-1">
          {mode === "signin"
            ? "Sign in to continue managing your workflow"
            : "Join OneFlow and get started instantly"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-6">
          {/* Sign In */}
          <Button
            type="button"
            onClick={() => setMode("signin")}
            className={`w-1/2 py-2.5 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600
              ${mode === "signin" ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            Sign In
          </Button>

          {/* Sign Up */}
          <Button
            type="button"
            onClick={() => setMode("signup")}
            className={`w-1/2 py-2.5 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600
              ${mode === "signup" ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            Sign Up
          </Button>
        </div>

        {/* Error Message */}
        {(error || localError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{localError || error}</p>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && (
            <>
              <div className="space-y-1">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
          >
            {isLoading
              ? mode === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
          </Button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1">
          <p className="font-semibold text-gray-800">Test Credentials:</p>
          <p>Admin: admin@oneflow.local / admin@123</p>
          <p>PM: pm@oneflow.local / pm@123</p>
          <p>Finance: finance@oneflow.local / finance@123</p>
          <p>Team: team@oneflow.local / team@123</p>
        </div>
      </CardContent>
    </Card>

    {/* Footer */}
    <p className="mt-8 text-xs text-gray-500">
      © 2025 <span className="font-semibold text-gray-800">OneFlow</span>. All rights reserved.
    </p>
  </div>
)
}