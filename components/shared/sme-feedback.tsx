"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface SmeFeedbackProps {
  contentId: string
  contentType: string
}

export function SmeFeedback({ contentId, contentType }: SmeFeedbackProps) {
  const [feedbackType, setFeedbackType] = useState<"approve" | "reject" | "review" | null>(null)
  const [comments, setComments] = useState("")

  const handleSubmit = () => {
    console.log({
      contentId,
      contentType,
      feedbackType,
      comments,
    })
    // Reset after submission
    setFeedbackType(null)
    setComments("")
  }

  return (
    <Card className="mt-6 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">SME Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button
            variant={feedbackType === "approve" ? "default" : "outline"}
            size="sm"
            onClick={() => setFeedbackType("approve")}
            className="flex items-center"
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button
            variant={feedbackType === "reject" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFeedbackType("reject")}
            className="flex items-center"
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button
            variant={feedbackType === "review" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFeedbackType("review")}
            className="flex items-center"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Needs Review
          </Button>
        </div>

        {feedbackType && (
          <Textarea
            placeholder="Add your comments here..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="min-h-[100px]"
          />
        )}
      </CardContent>
      {feedbackType && (
        <CardFooter>
          <Button onClick={handleSubmit} className="ml-auto">
            Submit Feedback
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

