"use client"

import React, { createContext, useState } from "react"
import clsx from "clsx"

interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType>({ activeTab: "", setActiveTab: () => {} })

export const Tabs = ({ children, defaultValue, className }: { children: React.ReactNode; defaultValue?: string; className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || "")
  return (
    <div className={className}>
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>{children}</TabsContext.Provider>
    </div>
  )
}

export const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx("flex flex-wrap gap-2 border-b border-[#e2e8f0] bg-white p-2", className)}>{children}</div>
)

export const TabsTrigger = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext)
  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={clsx(
        "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/15",
        activeTab === value
          ? "bg-[#1a3c6e] text-white"
          : "border border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#1a3c6e] hover:text-[#1a3c6e]",
      )}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const { activeTab } = React.useContext(TabsContext)
  return activeTab === value ? <div className={className}>{children}</div> : null
}
