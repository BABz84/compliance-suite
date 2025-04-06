"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppState } from "@/lib/store/AppStateProvider"
import { 
  LayoutDashboard, 
  MessagesSquare, 
  FileText, 
  FileEdit, 
  BookOpen, 
  FolderOpen, 
  CheckSquare, 
  BarChart3 
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { auth: { hasPermission } } = useAppState()
  
  // Define navigation links with permission requirements and icons
  const navLinks = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: null },
    { name: "Regulatory Q&A", href: "/regulatory-qa", icon: MessagesSquare, permission: "use:ai" },
    { name: "Contract Review", href: "/contract-review", icon: FileText, permission: "use:ai" },
    { name: "Policy Drafting", href: "/policy-drafting", icon: FileEdit, permission: "use:ai" },
    { name: "Regulatory Summarization", href: "/regulatory-summarization", icon: BookOpen, permission: "use:ai" },
    { name: "Documents", href: "/documents", icon: FolderOpen, permission: "read:documents" },
    { name: "SME Validation", href: "/sme-validation", icon: CheckSquare, permission: "validate:ai" },
    { name: "Analytics", href: "/analytics", icon: BarChart3, permission: "view:reports" }
  ]
  
  return (
    <div className="pb-12 w-64 border-r h-screen">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Features</h2>
          <div className="space-y-1">
            {navLinks.map(link => {
              // Skip items the user doesn't have permission for
              if (link.permission && !hasPermission(link.permission)) {
                return null
              }
              
              const isActive = pathname === link.href
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "transparent"
                  )}
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

