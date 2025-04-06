"use client"

import { useState, useEffect } from "react"
import { Send, Loader2, RefreshCw, X, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAiStore, useDocumentStore, useAuthStore, withStateManagement } from "@/lib/store"
import { v4 as uuidv4 } from 'uuid'

function RegulatoryQAPage() {
  // Input state
  const [query, setQuery] = useState("")
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  
  // UI state
  const [activeTab, setActiveTab] = useState("query")
  
  // Get user from auth store
  const { user } = useAuthStore()
  
  // Access document store for context selection
  const { documents, filteredDocuments } = useDocumentStore()
  
  // Access AI store for interactions
  const { 
    interactions, 
    addInteraction, 
    interactionStatus, 
    interactionError,
    getFilteredInteractions
  } = useAiStore()
  
  // Get filtered Q&A history
  const qaHistory = getFilteredInteractions()
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    // Create document context array
    const context = selectedDocuments.length > 0 
      ? { documentIds: selectedDocuments } 
      : undefined
    
    // Create a unique ID for this interaction
    const interactionId = uuidv4()
    
    // Sample response (in production, this would be an API call)
    const sampleResponse = `Based on the current regulatory framework, the requirement you're asking about falls under Article 17 of GDPR ("Right to erasure" or "Right to be forgotten").

Key points to consider:
1. Organizations must erase personal data "without undue delay" when requested by the data subject under specific circumstances.
2. These circumstances include when the data is no longer necessary, when consent is withdrawn, when the data subject objects, or when the processing was unlawful.
3. There are exceptions where the right to erasure doesn't apply, such as for compliance with legal obligations, public interest in public health, or for the establishment, exercise, or defense of legal claims.

For financial institutions specifically, you need to balance this right with other regulatory requirements like record-keeping obligations under financial regulations. In cases of conflict, you may need to restrict rather than erase data, and clearly communicate this to the data subject.

I recommend documenting your erasure process thoroughly, including verification procedures and timelines.`
    
    // In a real implementation, we would make an API call here
    // For now, simulate the API call with a timeout
    setTimeout(() => {
      // Add the interaction to the AI store
      addInteraction({
        id: interactionId,
        featureType: 'regulatory-qa',
        userId: user?.id || 'unknown',
        userRole: user?.role || 'unknown',
        prompt: query,
        context: context,
        response: sampleResponse,
        createdAt: new Date(),
        reviewStatus: 'pending',
        sourceCitations: ['GDPR Article 17', 'Financial Record Keeping Regulation 45-106']
      })
      
      // Clear the form after successful submission
      setQuery("")
      setSelectedDocuments([])
    }, 2000)
  }
  
  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }
  
  const isLoading = interactionStatus === 'loading'
  const isError = interactionStatus === 'error'
  
  // Create a timestamp display function
  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Regulatory Q&A</h1>
        <p className="text-muted-foreground">Ask questions about regulatory requirements and get AI-powered answers</p>
      </div>

      <Tabs defaultValue="query" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="query">Ask a Question</TabsTrigger>
          <TabsTrigger value="history">Query History {qaHistory.length > 0 && `(${qaHistory.length})`}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="query" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ask Your Question</CardTitle>
              <CardDescription>Be specific about the regulation, jurisdiction, and context</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="E.g., What are the GDPR requirements for data deletion requests for financial institutions?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[120px]"
                />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Select Regulatory Context (Optional)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredDocuments
                      .filter(doc => doc.type === 'regulation')
                      .map(doc => (
                        <div 
                          key={doc.id}
                          className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer border ${
                            selectedDocuments.includes(doc.id) 
                              ? 'border-primary bg-primary/5' 
                              : 'border-input'
                          }`}
                          onClick={() => handleSelectDocument(doc.id)}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{doc.name}</p>
                            {doc.jurisdiction && (
                              <Badge variant="outline" className="mt-1">
                                {doc.jurisdiction}
                              </Badge>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {selectedDocuments.includes(doc.id) ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : null}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => {
                  setQuery("")
                  setSelectedDocuments([])
                }}>
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
          
          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {interactionError || "There was an error processing your request. Please try again."}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Show the most recent interaction if not loading */}
          {!isLoading && qaHistory.length > 0 && (
            <Card className="border-primary/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Response</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant="outline">AI Generated</Badge>
                    <Badge 
                      variant={qaHistory[0].reviewStatus === 'accurate' ? 'default' : 'outline'}
                      className={qaHistory[0].reviewStatus === 'accurate' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                    >
                      {qaHistory[0].reviewStatus === 'accurate' ? 'Verified' : 'Pending Review'}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {qaHistory[0].sourceCitations && qaHistory[0].sourceCitations.length > 0 && (
                    <div className="mt-1">
                      <span className="text-xs font-medium">Sources: </span>
                      {qaHistory[0].sourceCitations.map((source, idx) => (
                        <span key={idx} className="text-xs text-muted-foreground">
                          {source}{idx < qaHistory[0].sourceCitations!.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">{qaHistory[0].response}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Query History</CardTitle>
              <CardDescription>Your recent regulatory queries and responses</CardDescription>
            </CardHeader>
            <CardContent>
              {qaHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your query history will appear here.</p>
              ) : (
                <div className="space-y-4">
                  {qaHistory.map((interaction, index) => (
                    <div key={interaction.id} className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{interaction.prompt.substring(0, 60)}...</h3>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(interaction.createdAt)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge 
                            variant={interaction.reviewStatus === 'accurate' ? 'default' : 'outline'}
                            className={interaction.reviewStatus === 'accurate' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                          >
                            {interaction.reviewStatus === 'accurate' ? 'Verified' : 'Pending Review'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {interaction.response.substring(0, 150)}...
                      </p>
                      {index < qaHistory.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Export with state management HOC
export default withStateManagement(RegulatoryQAPage)