"use client"

import type React from "react"

import { useState } from "react"
import { FileText, Upload, Loader2, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SmeFeedback } from "@/components/shared/sme-feedback"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ContractReviewPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) return

    setIsLoading(true)
    setAnalysis(null)

    // Simulate AI analysis
    setTimeout(() => {
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

      setAnalysis(sampleAnalysis)
      setAnalysisId(`contract-${Date.now()}`)
      setIsLoading(false)
    }, 3000)
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contract Review</h1>
        <p className="text-muted-foreground">AI-powered contract analysis and risk assessment</p>
      </div>

      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">Review Contract</TabsTrigger>
          <TabsTrigger value="history">Review History</TabsTrigger>
        </TabsList>
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Contract</CardTitle>
              <CardDescription>Upload a contract document for AI analysis</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract-file">Contract Document</Label>
                    <Input id="contract-file" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                    {selectedFile && (
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <FileText className="mr-2 h-4 w-4" />
                        {selectedFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={!selectedFile || isLoading} className="ml-auto">
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

          {analysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Contract Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Summary</h3>
                    <p className="mt-2 text-muted-foreground">{analysis.summary}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-xl font-bold text-primary">{analysis.riskScore}</span>
                    </div>
                    <div>
                      <p className="font-medium">Risk Score</p>
                      <p className="text-sm text-muted-foreground">
                        {analysis.riskScore < 50 ? "Low" : analysis.riskScore < 75 ? "Medium" : "High"} risk contract
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Key Findings</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {analysis.findings.map((finding: any) => (
                        <AccordionItem key={finding.id} value={finding.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center">
                              {getSeverityIcon(finding.severity)}
                              <span className="ml-2 font-medium">{finding.title}</span>
                              <span className={`ml-4 text-xs uppercase ${getSeverityColor(finding.severity)}`}>
                                {finding.severity}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2">
                              <div>
                                <span className="font-medium">Category:</span> {finding.category}
                              </div>
                              <div>
                                <span className="font-medium">Clause:</span> {finding.clause}
                              </div>
                              <div>
                                <span className="font-medium">Issue:</span> {finding.description}
                              </div>
                              <div>
                                <span className="font-medium">Recommendation:</span> {finding.recommendation}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Compliance Assessment</h3>
                    <div className="space-y-4">
                      {analysis.complianceIssues.map((issue: any, index: number) => (
                        <Alert key={index} variant={issue.status === "Non-compliant" ? "destructive" : "default"}>
                          <AlertTitle className="flex items-center">
                            {issue.status === "Non-compliant" ? (
                              <AlertTriangle className="mr-2 h-4 w-4" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {issue.regulation}: {issue.status}
                          </AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc pl-5 mt-2">
                              {issue.issues.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {analysisId && <SmeFeedback contentId={analysisId} contentType="contract-review" />}
            </>
          )}
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Review History</CardTitle>
              <CardDescription>Your recent contract reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Your contract review history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

