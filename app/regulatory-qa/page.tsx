"use client"

import type React from "react"

import { useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SmeFeedback } from "@/components/shared/sme-feedback"

export default function RegulatoryQAPage() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [responseId, setResponseId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setResponse(null)

    // Simulate AI response
    setTimeout(() => {
      const sampleResponse = `Based on the current regulatory framework, the requirement you're asking about falls under Article 17 of GDPR ("Right to erasure" or "Right to be forgotten").

Key points to consider:
1. Organizations must erase personal data "without undue delay" when requested by the data subject under specific circumstances.
2. These circumstances include when the data is no longer necessary, when consent is withdrawn, when the data subject objects, or when the processing was unlawful.
3. There are exceptions where the right to erasure doesn't apply, such as for compliance with legal obligations, public interest in public health, or for the establishment, exercise, or defense of legal claims.

For financial institutions specifically, you need to balance this right with other regulatory requirements like record-keeping obligations under financial regulations. In cases of conflict, you may need to restrict rather than erase data, and clearly communicate this to the data subject.

I recommend documenting your erasure process thoroughly, including verification procedures and timelines.`

      setResponse(sampleResponse)
      setResponseId(`qa-${Date.now()}`)
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Regulatory Q&A</h1>
        <p className="text-muted-foreground">Ask questions about regulatory requirements and get AI-powered answers</p>
      </div>

      <Tabs defaultValue="query">
        <TabsList>
          <TabsTrigger value="query">Ask a Question</TabsTrigger>
          <TabsTrigger value="history">Query History</TabsTrigger>
        </TabsList>
        <TabsContent value="query" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ask Your Question</CardTitle>
              <CardDescription>Be specific about the regulation, jurisdiction, and context</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <Textarea
                  placeholder="E.g., What are the GDPR requirements for data deletion requests for financial institutions?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[120px]"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => setQuery("")}>
                  Clear
                </Button>
                <Button type="submit" disabled={!query.trim() || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Ask
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          )}

          {response && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">{response}</div>
                </CardContent>
              </Card>

              {responseId && <SmeFeedback contentId={responseId} contentType="regulatory-qa" />}
            </>
          )}
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Query History</CardTitle>
              <CardDescription>Your recent regulatory queries and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Your query history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

