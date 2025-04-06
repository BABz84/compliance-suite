import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, MessageSquare, FileCheck, FilePen, Scale } from "lucide-react"

// Sample data for recent activity
const activities = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
    },
    action: "uploaded",
    item: "Q2 Compliance Report",
    time: "2 hours ago",
    icon: FileText,
  },
  {
    id: 2,
    user: {
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MC",
    },
    action: "queried",
    item: "GDPR Article 17 interpretation",
    time: "4 hours ago",
    icon: MessageSquare,
  },
  {
    id: 3,
    user: {
      name: "Alex Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AR",
    },
    action: "reviewed",
    item: "Vendor Contract #28945",
    time: "Yesterday",
    icon: FileCheck,
  },
  {
    id: 4,
    user: {
      name: "Emily Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EW",
    },
    action: "drafted",
    item: "Data Privacy Policy",
    time: "Yesterday",
    icon: FilePen,
  },
  {
    id: 5,
    user: {
      name: "David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DK",
    },
    action: "analyzed",
    item: "Regulatory Gap Assessment",
    time: "2 days ago",
    icon: Scale,
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon

        return (
          <div key={activity.id} className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              <AvatarFallback>{activity.user.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.user.name} <span className="text-muted-foreground">{activity.action}</span> {activity.item}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Icon className="mr-1 h-3 w-3" />
                <span>{activity.time}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

