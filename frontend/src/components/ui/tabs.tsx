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
  <div className={clsx("flex border-b border-gray-200 bg-gray-50", className)}>{children}</div>
)

export const TabsTrigger = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext)
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={clsx(
        "px-4 py-3 font-medium text-sm transition-colors",
        activeTab === value ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900",
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
