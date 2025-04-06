"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  FileText,
  MessageSquare,
  FileQuestion,
  Scale,
  FileCheck,
  FilePen,
  ShieldCheck,
  GitCompare,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"

const navItems = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Document Management", href: "/documents", icon: FileText },
  { name: "Regulatory Q&A", href: "/regulatory-qa", icon: MessageSquare },
  { name: "Regulatory Summarization", href: "/regulatory-summary", icon: FileQuestion },
  { name: "Jurisdictional Comparison", href: "/jurisdictional-comparison", icon: GitCompare },
  { name: "Contract Review", href: "/contract-review", icon: FileCheck },
  { name: "Policy Drafting", href: "/policy-drafting", icon: FilePen },
  { name: "Control Design", href: "/control-design", icon: ShieldCheck },
  { name: "Alignment / Gap Detection", href: "/alignment-detection", icon: Scale },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { logout, user } = useAuthStore()
  
  if (!user) return null;

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="font-semibold text-lg">
            <span className="text-primary">Gen-AI</span> Compliance
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                  collapsed && "justify-center",
                )}
              >
                <Icon size={20} className={cn("flex-shrink-0", collapsed ? "" : "mr-3")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
            collapsed && "justify-center px-0",
          )}
          onClick={logout}
        >
          <LogOut size={20} className={cn("flex-shrink-0", collapsed ? "" : "mr-3")} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}

