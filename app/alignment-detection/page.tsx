"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, FileText, Upload, Check, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SmeFeedback } from "@/components/shared/sme-feedback"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Sample frameworks
const frameworks = [
  { value: "gdpr", label: "GDPR" },
  { value: "ccpa", label: "CCPA/CPRA" },
  { value: "hipaa", label: "HIPAA" },
  { value: "pci-dss", label: "PCI DSS" },
  { value: "nist-csf", label: "NIST Cybersecurity Framework" },
  { value: "iso-27001", label: "ISO 27001" },
  { value: "sox", label: "Sarbanes-Oxley (SOX)" },
]

export default function AlignmentDetectionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFramework, setSelectedFramework] = useState("")
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

    if (!selectedFile || !selectedFramework) {
      return
    }

    setIsLoading(true)
    setAnalysis(null)

    // Simulate AI analysis
    setTimeout(() => {
      const sampleAnalysis = {
        documentName: "Privacy Policy v2.1.docx",
        framework: "GDPR",
        overallAlignment: 78,
        summary:
          "The document shows good alignment with GDPR in many areas, particularly regarding data subject rights and processing purposes. However, there are significant gaps in international transfer provisions, data retention specifics, and DPO contact information.",
        alignmentByCategory: [
          { category: "Lawful Basis for Processing", alignment: 90, status: "high" },
          { category: "Transparency and Notice", alignment: 85, status: "high" },
          { category: "Data Subject Rights", alignment: 95, status: "high" },
          { category: "Data Security", alignment: 70, status: "medium" },
          { category: "Data Retention", alignment: 60, status: "medium" },
          { category: "International Transfers", alignment: 45, status: "low" },
          { category: "Processor Obligations", alignment: 80, status: "high" },
          { category: "DPO and Accountability", alignment: 65, status: "medium" },
        ],
        gaps: [
          {
            id: "gap-1",
            category: "International Transfers",
            severity: "high",
            description: "No mention of safeguards for international data transfers (SCCs, BCRs, etc.)",
            recommendation:
              "Add specific section detailing the safeguards used for international transfers, including reference to Standard Contractual Clauses or other transfer mechanisms.",
            reference: "GDPR Art. 44-49",
          },
          {
            id: "gap-2",
            category: "Data Retention",
            severity: "medium",
            description: "Retention periods are vague and not specific to data categories",
            recommendation:
              "Specify retention periods for each category of personal data, with clear criteria for determining those periods.",
            reference: "GDPR Art. 13(2)(a), Art. 30(1)(f)",
          },
          {
            id: "gap-3",
            category: "DPO and Accountability",
            severity: "medium",
            description: "Missing DPO contact information and role description",
            recommendation:
              "Include contact details for the Data Protection Officer and outline their role in ensuring compliance.",
            reference: "GDPR Art. 13(1)(b), Art. 37-39",
          },
          {
            id: "gap-4",
            category: "Data Security",
            severity: "low",
            description: "Security measures described in general terms without specifics",
            recommendation:
              "Provide more specific information about technical and organizational security measures implemented.",
            reference: "GDPR Art. 32",
          },
        ],
      }

      setAnalysis(sampleAnalysis)
      setAnalysisId(`alignment-${Date.now()}`)
      setIsLoading(false)
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "high":
        return <Check className="h-5 w-5 text-green-500" />
      case "medium":
        return <Info className="h-5 w-5 text-amber-500" />
      case "low":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getStatusColor = (alignment: number) => {
    if (alignment >= 80) return "bg-green-500"
    if (alignment >= 60) return "bg-amber-500"
    return "bg-red-500"
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alignment / Gap Detection</h1>
        <p className="text-muted-foreground">Analyze documents for alignment with regulatory frameworks</p>
      </div>

      <Tabs defaultValue="analyze">
        <TabsList>
          <TabsTrigger value="analyze">Analyze Document</TabsTrigger>
          <TabsTrigger value="history">Analysis History</TabsTrigger>
        </TabsList>
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Analysis</CardTitle>
              <CardDescription>Upload a document and select a framework to analyze</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-file">Document</Label>
                  <Input id="document-file" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                  {selectedFile && (
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <FileText className="mr-2 h-4 w-4" />
                      {selectedFile.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="framework">Regulatory Framework</Label>
                  <Select value={selectedFramework} onValueChange={setSelectedFramework} required>
                    <SelectTrigger id="framework">
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={!selectedFile || !selectedFramework || isLoading} className="ml-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Analyze Document
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full rounded-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {analysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    {analysis.documentName} alignment with {analysis.framework}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Summary</h3>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">Overall Alignment</h3>
                      <span className="font-bold">{analysis.overallAlignment}%</span>
                    </div>
                    <Progress value={analysis.overallAlignment} className={getStatusColor(analysis.overallAlignment)} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Alignment by Category</h3>
                    <div className="space-y-4">
                      {analysis.alignmentByCategory.map((category: any) => (
                        <div key={category.category} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              {getStatusIcon(category.status)}
                              <span className="ml-2">{category.category}</span>
                            </div>
                            <span className="font-medium">{category.alignment}%</span>
                          </div>
                          <Progress value={category.alignment} className={getStatusColor(category.alignment)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Identified Gaps</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {analysis.gaps.map((gap: any) => (
                        <AccordionItem key={gap.id} value={gap.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center">
                              <AlertTriangle className={`mr-2 h-4 w-4 ${getSeverityColor(gap.severity)}`} />
                              <span className="font-medium">{gap.description}</span>
                              <span className={`ml-4 text-xs uppercase ${getSeverityColor(gap.severity)}`}>
                                {gap.severity}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2">
                              <div>
                                <span className="font-medium">Category:</span> {gap.category}
                              </div>
                              <div>
                                <span className="font-medium">Recommendation:</span> {gap.recommendation}
                              </div>
                              <div>
                                <span className="font-medium">Reference:</span> {gap.reference}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </CardContent>
              </Card>

              {analysisId && <SmeFeedback contentId={analysisId} contentType="alignment-detection" />}
            </>
          )}
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>Your recent document alignment analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Your analysis history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

