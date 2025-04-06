"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SmeFeedback } from "@/components/shared/sme-feedback"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Sample jurisdictions and topics
const jurisdictions = [
  { value: "eu", label: "European Union" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "sg", label: "Singapore" },
  { value: "jp", label: "Japan" },
]

const topics = [
  { value: "data-privacy", label: "Data Privacy" },
  { value: "financial-reporting", label: "Financial Reporting" },
  { value: "aml", label: "Anti-Money Laundering" },
  { value: "consumer-protection", label: "Consumer Protection" },
  { value: "securities", label: "Securities Regulation" },
  { value: "banking", label: "Banking Regulation" },
  { value: "insurance", label: "Insurance Regulation" },
]

export default function JurisdictionalComparisonPage() {
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState("")
  const [additionalContext, setAdditionalContext] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [comparison, setComparison] = useState<string | null>(null)
  const [comparisonId, setComparisonId] = useState<string | null>(null)

  const handleAddJurisdiction = (value: string) => {
    if (!selectedJurisdictions.includes(value)) {
      setSelectedJurisdictions([...selectedJurisdictions, value])
    }
  }

  const handleRemoveJurisdiction = (value: string) => {
    setSelectedJurisdictions(selectedJurisdictions.filter((j) => j !== value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedJurisdictions.length < 2 || !selectedTopic) {
      return
    }

    setIsLoading(true)
    setComparison(null)

    // Simulate AI comparison generation
    setTimeout(() => {
      const sampleComparison = `# Data Privacy Regulation Comparison: EU vs. US

## Overview
The EU and US have fundamentally different approaches to data privacy regulation. The EU follows a comprehensive, rights-based approach, while the US has a sectoral, harm-prevention approach.

## Key Regulatory Frameworks

### European Union
- **Primary Framework**: General Data Protection Regulation (GDPR)
- **Regulatory Authority**: National Data Protection Authorities and European Data Protection Board
- **Scope**: Comprehensive coverage of all personal data processing
- **Approach**: Rights-based, focused on individual control of personal data

### United States
- **Primary Frameworks**: Sectoral laws (HIPAA, GLBA, CCPA, CPRA, etc.)
- **Regulatory Authorities**: FTC, HHS, State Attorneys General, etc.
- **Scope**: Sector-specific with some state-level comprehensive laws
- **Approach**: Harm-prevention, focused on preventing misuse

## Comparison of Key Elements

| Element | European Union | United States |
|---------|---------------|---------------|
| Legal Basis | Requires specific legal basis for processing | Generally permits processing unless prohibited |
| Consent | Must be freely given, specific, informed, and unambiguous | Requirements vary by sector and state |
| Individual Rights |  specific, informed, and unambiguous | Requirements vary by sector and state |
| Individual Rights | Comprehensive (access, rectification, erasure, portability, etc.) | Limited and varies by sector/state |
| Data Breach Notification | Mandatory within 72 hours | Varies by state and sector |
| Enforcement | Administrative fines up to 4% global turnover | Varies; FTC enforcement, state AG actions, private rights of action |
| Cross-Border Transfers | Restricted unless adequate protections exist | Generally permitted with fewer restrictions |

## Practical Implications for Compliance

### Multi-jurisdictional Approach
Organizations operating in both jurisdictions typically implement GDPR-level protections globally, with specific adjustments for US requirements.

### Key Compliance Challenges
1. **Consent Management**: Different standards require nuanced approaches
2. **Data Subject Rights**: Need processes that can handle both regimes
3. **Data Transfer Mechanisms**: EU-US data transfers require specific safeguards
4. **Documentation**: Different record-keeping requirements
5. **Privacy Notices**: Must address requirements of both regimes

## Recent Developments
- **EU**: Increased enforcement of GDPR, focus on international transfers
- **US**: Growing state-level legislation (CPRA, VCDPA, CPA, etc.)
- **Convergence**: Some US laws moving closer to GDPR principles

## Conclusion
While fundamental differences remain, there is a gradual convergence in certain areas. Organizations should maintain flexibility in their compliance programs to adapt to evolving requirements in both jurisdictions.`

      setComparison(sampleComparison)
      setComparisonId(`comparison-${Date.now()}`)
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jurisdictional Comparison</h1>
        <p className="text-muted-foreground">Compare regulatory requirements across different jurisdictions</p>
      </div>

      <Tabs defaultValue="compare">
        <TabsList>
          <TabsTrigger value="compare">Create Comparison</TabsTrigger>
          <TabsTrigger value="history">Comparison History</TabsTrigger>
        </TabsList>
        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparison Parameters</CardTitle>
              <CardDescription>Select jurisdictions and topic to compare</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Jurisdictions (select at least 2)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedJurisdictions.map((j) => {
                      const jurisdiction = jurisdictions.find((item) => item.value === j)
                      return (
                        <div
                          key={j}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {jurisdiction?.label}
                          <button
                            type="button"
                            className="ml-2 text-primary hover:text-primary/80"
                            onClick={() => handleRemoveJurisdiction(j)}
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <Select onValueChange={handleAddJurisdiction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictions.map((jurisdiction) => (
                        <SelectItem
                          key={jurisdiction.value}
                          value={jurisdiction.value}
                          disabled={selectedJurisdictions.includes(jurisdiction.value)}
                        >
                          {jurisdiction.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Regulatory Topic</Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger id="topic">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.value} value={topic.value}>
                          {topic.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Additional Context (Optional)</Label>
                  <Textarea
                    id="context"
                    placeholder="Add any specific aspects or questions you'd like addressed in the comparison..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={selectedJurisdictions.length < 2 || !selectedTopic || isLoading}
                  className="ml-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Comparison"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Comparison Results</CardTitle>
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

          {comparison && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Comparison Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-line">{comparison}</div>
                  </div>
                </CardContent>
              </Card>

              {comparisonId && <SmeFeedback contentId={comparisonId} contentType="jurisdictional-comparison" />}
            </>
          )}
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Comparison History</CardTitle>
              <CardDescription>Your recent jurisdictional comparisons</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Your comparison history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

