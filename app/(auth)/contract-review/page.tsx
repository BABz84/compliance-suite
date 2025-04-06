"use client"

import { useState, useEffect } from "react"
import { FileText, Upload, Loader2, AlertTriangle, CheckCircle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SmeFeedback } from "@/components/shared/sme-feedback"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAiStore, useDocumentStore, useAuthStore, withStateManagement } from "@/lib/store"
import { v4 as uuidv4 } from 'uuid'

function ContractReviewPage() {
  // Local state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
  const [selectedRegulatoryIds, setSelectedRegulatoryIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("review")
  
  // Access stores
  const { user } = useAuthStore()
  const { 
    documents, 
    filteredDocuments, 
    setDocumentTypeFilter 
  } = useDocumentStore()
  const { 
    addInteraction, 
    interactions, 
    interactionStatus, 
    interactionError,
    getFilteredInteractions,
    setFeatureFilter
  } = useAiStore()
  
  // Filter documents by type
  useEffect(() => {
    // We want to show contracts and regulations
    setDocumentTypeFilter('all')
  }, [setDocumentTypeFilter])
  
  // Filter AI interactions
  useEffect(() => {
    setFeatureFilter('contract-review')
  }, [setFeatureFilter])
  
  // Get contract review history
  const reviewHistory = getFilteredInteractions()
  
  // Get contracts and regulations from documents
  const contracts = filteredDocuments.filter(doc => doc.type === 'contract')
  const regulations = filteredDocuments.filter(doc => doc.type === 'regulation')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setSelectedContractId(null) // Clear selected contract when uploading new file
    }
  }
  
  const handleContractSelect = (id: string) => {
    setSelectedContractId(id)
    setSelectedFile(null) // Clear selected file when choosing existing contract
  }
  
  const handleRegulatorySelect = (id: string) => {
    setSelectedRegulatoryIds(prev => 
      prev.includes(id)
        ? prev.filter(regId => regId !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile && !selectedContractId) return
    
    // Create a context object for the AI interaction
    const context = {
      contractId: selectedContractId,
      regulationIds: selectedRegulatoryIds,
      uploadedFileName: selectedFile?.name
    }
    
    // Create a unique ID for this interaction
    const interactionId = uuidv4()
    
    // Sample analysis data (in a real app, this would come from an API call)
    const sampleAnalysis = {
      summary:
        "This is a standard vendor service agreement with several areas of concern related to data protection, liability limitations, and termination provisions.",
      riskScore: 72,
      findings: [
        {
          id: "finding-1",
          severity: "high",
          category: "Data Protection",
          title: "Inadequate Data Protection Provisions",
          description:
            "The contract lacks specific provisions regarding data security measures, breach notification timelines, and data subject rights under GDPR.",
          recommendation:
            "Add specific clauses addressing data security standards, 72-hour breach notification requirement, and provisions for handling data subject requests.",
          clause: "Section 8.2",
        },
        {
          id: "finding-2",
          severity: "high",
          category: "Liability",
          title: "Uncapped Liability for Data Breaches",
          description:
            "The contract does not cap liability for data breaches, potentially exposing the organization to unlimited financial risk.",
          recommendation:
            "Negotiate a reasonable liability cap for data breaches while maintaining uncapped liability for willful misconduct.",
          clause: "Section 12.1",
        },
        {
          id: "finding-3",
          severity: "medium",
          category: "Termination",
          title: "Restrictive Termination Provisions",
          description:
            "The contract requires 90 days notice for termination and includes substantial early termination fees.",
          recommendation:
            "Negotiate shorter notice period (30-60 days) and reduced or eliminated early termination fees in case of vendor non-performance.",
          clause: "Section 15.3",
        },
        {
          id: "finding-4",
          severity: "medium",
          category: "Intellectual Property",
          title: "Ambiguous IP Ownership",
          description:
            "The contract has unclear provisions regarding ownership of derivative works and customizations.",
          recommendation:
            "Clarify ownership of all customizations and derivative works created during the engagement.",
          clause: "Section 10.2",
        },
        {
          id: "finding-5",
          severity: "low",
          category: "Payment Terms",
          title: "Net-60 Payment Terms",
          description: "The contract specifies Net-60 payment terms, which is longer than company standard.",
          recommendation: "Negotiate Net-30 payment terms in line with company policy.",
          clause: "Section 5.1",
        },
      ],
      complianceIssues: [
        {
          regulation: "GDPR",
          status: "Non-compliant",
          issues: ["Inadequate processor obligations", "Missing data subject rights provisions"],
        },
        {
          regulation: "Industry Standards",
          status: "Partially compliant",
          issues: ["Security standards below industry benchmarks"],
        },
      ],
    }
    
    // In a real implementation, we would make an API call
    // Simulate API call with timeout
    setTimeout(() => {
      // Add the interaction to the AI store
      addInteraction({
        id: interactionId,
        featureType: 'contract-review',
        userId: user?.id || 'unknown',
        userRole: user?.role || 'unknown',
        prompt: `Analyze contract ${selectedContractId ? 'ID: ' + selectedContractId : selectedFile?.name}`,
        context: context,
        response: JSON.stringify(sampleAnalysis),
        createdAt: new Date(),
        reviewStatus: 'pending',
        sourceCitations: selectedRegulatoryIds.length > 0 
          ? regulations
              .filter(reg => selectedRegulatoryIds.includes(reg.id))
              .map(reg => reg.name)
          : ['General Contract Law', 'Industry Standards']
      })
      
      // Reset selection state after submission
      setSelectedRegulatoryIds([])
    }, 2000)
  }
  
  const isLoading = interactionStatus === 'loading'
  const isError = interactionStatus === 'error'
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500 dark:text-red-400"
      case "medium":
        return "text-amber-500 dark:text-amber-400"
      case "low":
        return "text-blue-500 dark:text-blue-400"
      default:
        return "text-slate-500"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
      case "medium":
        return <Info className="h-5 w-5 text-amber-500 dark:text-amber-400" />
      case "low":
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      default:
        return <Info className="h-5 w-5" />
    }
  }
  
  // Format date for history view
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date)
  }
  
  // Parse the analysis from JSON string
  const parseAnalysis = (jsonString: string) => {
    try {
      return JSON.parse(jsonString)
    } catch (e) {
      console.error('Error parsing analysis JSON:', e)
      return null
    }
  }
  
  // Get the latest analysis
  const latestAnalysis = reviewHistory.length > 0 
    ? parseAnalysis(reviewHistory[0].response)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contract Review</h1>
        <p className="text-muted-foreground">AI-powered contract analysis and risk assessment</p>
      </div>

      <Tabs defaultValue="review" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="review">Review Contract</TabsTrigger>
          <TabsTrigger value="history">
            Review History {reviewHistory.length > 0 && `(${reviewHistory.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Selection</CardTitle>
              <CardDescription>Upload a new contract or select an existing one</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload new contract */}
                  <div className="space-y-2">
                    <Label htmlFor="contract-file">Upload New Contract</Label>
                    <Input 
                      id="contract-file" 
                      type="file" 
                      onChange={handleFileChange} 
                      accept=".pdf,.doc,.docx,.txt"
                      disabled={isLoading || !!selectedContractId}
                    />
                    {selectedFile && (
                      <div className="flex items-center justify-between text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded-md mt-2">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          {selectedFile.name}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(null)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">OR</span>
                    </div>
                  </div>
                  
                  {/* Select existing contract */}
                  <div className="space-y-2">
                    <Label htmlFor="existing-contract">Select Existing Contract</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {contracts.map(contract => (
                        <div 
                          key={contract.id}
                          className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer border ${
                            selectedContractId === contract.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-input'
                          }`}
                          onClick={() => handleContractSelect(contract.id)}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{contract.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Intl.DateTimeFormat('en-US').format(contract.uploadDate)}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {selectedContractId === contract.id ? (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Regulatory context */}
                  <div className="space-y-2 pt-4">
                    <Label>Regulatory Context (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {regulations.map(regulation => (
                        <div 
                          key={regulation.id}
                          className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer border ${
                            selectedRegulatoryIds.includes(regulation.id) 
                              ? 'border-primary bg-primary/5' 
                              : 'border-input'
                          }`}
                          onClick={() => handleRegulatorySelect(regulation.id)}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{regulation.name}</p>
                            {regulation.jurisdiction && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {regulation.jurisdiction}
                              </Badge>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {selectedRegulatoryIds.includes(regulation.id) ? (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={(!selectedFile && !selectedContractId) || isLoading} 
                  className="ml-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Analyze Contract
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Contract Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />

                  <div className="flex items-center space-x-4 mt-6">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>

                  <Skeleton className="h-[300px] w-full mt-6" />
                </div>
              </CardContent>
            </Card>
          )}
          
          {isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {interactionError || "There was an error analyzing the contract. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && latestAnalysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Contract Analysis</CardTitle>
                  <CardDescription>
                    {reviewHistory[0].context?.uploadedFileName || 
                     (reviewHistory[0].context?.contractId && 
                      contracts.find(c => c.id === reviewHistory[0].context?.contractId)?.name)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Summary</h3>
                    <p className="mt-2 text-muted-foreground">{latestAnalysis.summary}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-xl font-bold text-primary">{latestAnalysis.riskScore}</span>
                    </div>
                    <div>
                      <p className="font-medium">Risk Score</p>
                      <p className="text-sm text-muted-foreground">
                        {latestAnalysis.riskScore < 50 ? "Low" : latestAnalysis.riskScore < 75 ? "Medium" : "High"} risk contract
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Key Findings</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {latestAnalysis.findings.map((finding: any) => (
                        <AccordionItem key={finding.id} value={finding.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center">
                              {getSeverityIcon(finding.severity)}
                              <div className="ml-2">
                                <span className={`font-medium ${getSeverityColor(finding.severity)}`}>
                                  {finding.title}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                  {finding.category}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-7">
                              <div>
                                <p className="text-sm font-medium">Description:</p>
                                <p className="text-sm text-muted-foreground">{finding.description}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Recommendation:</p>
                                <p className="text-sm text-muted-foreground">{finding.recommendation}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Clause:</p>
                                <p className="text-sm text-muted-foreground">{finding.clause}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Compliance Analysis</h3>
                    <div className="space-y-4">
                      {latestAnalysis.complianceIssues.map((compliance: any, index: number) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{compliance.regulation}</h4>
                              <p
                                className={`text-sm ${
                                  compliance.status === "Compliant"
                                    ? "text-green-600 dark:text-green-400"
                                    : compliance.status === "Partially compliant"
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {compliance.status}
                              </p>
                            </div>
                            {compliance.status === "Compliant" ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : compliance.status === "Partially compliant" ? (
                              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          {compliance.issues && compliance.issues.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Issues:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {compliance.issues.map((issue: string, i: number) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <SmeFeedback contentId={reviewHistory[0].id} contentType="contract-review" />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Contract Review History</CardTitle>
              <CardDescription>Previous contract analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contract reviews found.</p>
              ) : (
                <div className="space-y-4">
                  {reviewHistory.map((review) => {
                    const analysis = parseAnalysis(review.response)
                    if (!analysis) return null
                    
                    const contractName = review.context?.uploadedFileName || 
                      (review.context?.contractId && 
                       contracts.find(c => c.id === review.context?.contractId)?.name) || 
                      'Unknown Contract'
                      
                    return (
                      <div key={review.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{contractName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={
                                analysis.riskScore < 50 
                                  ? "bg-green-100 text-green-800" 
                                  : analysis.riskScore < 75 
                                  ? "bg-amber-100 text-amber-800" 
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              Risk: {analysis.riskScore}
                            </Badge>
                            <Badge 
                              variant={review.reviewStatus === 'accurate' ? 'default' : 'outline'}
                              className={review.reviewStatus === 'accurate' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                            >
                              {review.reviewStatus === 'accurate' ? 'Verified' : 'Pending Review'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm mt-2">{analysis.summary}</p>
                        <div className="mt-2">
                          <p className="text-xs font-medium">Key Issues:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {analysis.findings.slice(0, 3).map((finding: any) => (
                              <Badge 
                                key={finding.id}
                                variant="outline" 
                                className={`${getSeverityColor(finding.severity)} border-${getSeverityColor(finding.severity)} border-opacity-50`}
                              >
                                {finding.category}
                              </Badge>
                            ))}
                            {analysis.findings.length > 3 && (
                              <Badge variant="outline">+{analysis.findings.length - 3} more</Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setActiveTab("review")
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    )
                  })}
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
export default withStateManagement(ContractReviewPage) 