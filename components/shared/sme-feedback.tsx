"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAiStore, ReviewStatus, useAuthStore } from "@/lib/store"

interface SmeFeedbackProps {
  contentId: string
  contentType: string
}

export function SmeFeedback({ contentId, contentType }: SmeFeedbackProps) {
  // Local state
  const [feedbackType, setFeedbackType] = useState<"approve" | "reject" | "review" | null>(null)
  const [comments, setComments] = useState("")
  const [submitted, setSubmitted] = useState(false)
  
  // Get the user from auth store
  const { user } = useAuthStore()
  
  // Get AI interaction methods
  const { submitReview, interactions } = useAiStore()
  
  // Find the interaction
  const interaction = interactions.find(i => i.id === contentId)
  
  // Map feedback type to review status
  const getReviewStatus = (type: "approve" | "reject" | "review" | null): ReviewStatus => {
    switch (type) {
      case "approve":
        return "accurate"
      case "reject":
        return "inaccurate"
      case "review":
        return "needs-review"
      default:
        return "pending"
    }
  }

  const handleSubmit = () => {
    if (!feedbackType) return
    
    // Map feedback type to review status
    const reviewStatus = getReviewStatus(feedbackType)
    
    // Submit the review to the store
    submitReview(contentId, reviewStatus, comments)
    
    // Show success message
    setSubmitted(true)
    
    // Reset form
    setFeedbackType(null)
    setComments("")
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
    }, 3000)
  }
  
  // Check if user is SME or Admin
  const canReview = user?.role === 'sme' || user?.role === 'manager' || user?.role === 'admin'
  
  // Check if already reviewed
  const isReviewed = interaction?.reviewStatus !== 'pending'

  return (
    <Card className="mt-6 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          SME Feedback {interaction?.reviewerId === user?.id && "(Reviewed by you)"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canReview && (
          <p className="text-sm text-muted-foreground">
            Only Subject Matter Experts can provide feedback on AI-generated content.
          </p>
        )}
        
        {canReview && isReviewed && !submitted && (
          <div className="flex items-center space-x-2 text-sm py-1 px-3 rounded-md bg-slate-50 dark:bg-slate-800">
            <Check className="h-4 w-4 text-green-500" />
            <span>
              This content has already been reviewed with status: 
              <span className="font-medium ml-1">{interaction?.reviewStatus}</span>
            </span>
          </div>
        )}
        
        {canReview && !isReviewed && !submitted && (
          <>
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
          </>
        )}
        
        {submitted && (
          <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
            <AlertDescription>Your feedback has been submitted successfully.</AlertDescription>
          </Alert>
        )}
      </CardContent>
      {feedbackType && !submitted && (
        <CardFooter>
          <Button onClick={handleSubmit} className="ml-auto">
            Submit Feedback
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

