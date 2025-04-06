"use client"

import type React from "react"

import { useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SmeFeedback } from "@/components/shared/sme-feedback"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function RegulatorySummaryPage() {
  const [inputMethod, setInputMethod] = useState<"paste" | "upload">("paste")
  const [textInput, setTextInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryId, setSummaryId] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if ((inputMethod === "paste" && !textInput.trim()) || (inputMethod === "upload" && !selectedFile)) {
      return
    }

    setIsLoading(true)
    setSummary(null)

    // Simulate AI summary generation
    setTimeout(() => {
      const sampleSummary = `## Summary of GDPR Article 17: Right to Erasure

### Key Provisions:
1. **Core Right**: Data subjects have the right to request erasure of their personal data without undue delay.

2. **Grounds for Erasure**:
   - Data is no longer necessary for original purpose
   - Consent is withdrawn
   - Data subject objects to processing
   - Unlawful processing occurred
   - Legal obligation requires erasure
   - Data collected in relation to information society services offered to children

3. **Exceptions**:
   - Freedom of expression and information
   - Compliance with legal obligations
   - Public interest in public health
   - Archiving purposes in public interest
   - Establishment, exercise, or defense of legal claims

4. **Notification Requirement**: Controllers must inform other controllers processing the data about erasure requests.

5. **Technical Measures**: Reasonable steps must be taken, including technical measures, to inform processors of erasure requests.

### Practical Implications:
- Organizations must establish clear procedures for handling erasure requests
- Response timelines must be "without undue delay" (typically within one month)
- Record-keeping of erasure requests and actions is essential
- Verification processes for requestor identity are necessary
- Balance with other regulatory requirements must be maintained`

      setSummary(sampleSummary)
      setSummaryId(`summary-${Date.now()}`)
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Regulatory Summarization</h1>
        <p className="text-muted-foreground">Generate concise summaries of regulatory documents</p>
      </div>

      <Tabs defaultValue="summarize">
        <TabsList>
          <TabsTrigger value="summarize">Summarize Document</TabsTrigger>
          <TabsTrigger value="history">Summary History</TabsTrigger>
        </TabsList>
        <TabsContent value="summarize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Document</CardTitle>
              <CardDescription>Paste text or upload a document to summarize</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant={inputMethod === "paste" ? "default" : "outline"}
                    onClick={() => setInputMethod("paste")}
                  >
                    Paste Text
                  </Button>
                  <Button
                    type="button"
                    variant={inputMethod === "upload" ? "default" : "outline"}
                    onClick={() => setInputMethod("upload")}
                  >
                    Upload Document
                  </Button>
                </div>

                {inputMethod === "paste" ? (
                  <div className="space-y-2">
                    <Label htmlFor="text-input">Regulatory Text</Label>
                    <Textarea
                      id="text-input"
                      placeholder="Paste the regulatory text here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="file-input">Document</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="file-input" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                      {selectedFile && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <FileText className="mr-1 h-4 w-4" />
                          {selectedFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setTextInput("")
                    setSelectedFile(null)
                  }}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={
                    (inputMethod === "paste" && !textInput.trim()) ||
                    (inputMethod === "upload" && !selectedFile) ||
                    isLoading
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Summary"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
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

          {summary && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-line">{summary}</div>
                  </div>
                </CardContent>
              </Card>

              {summaryId && <SmeFeedback contentId={summaryId} contentType="regulatory-summary" />}
            </>
          )}
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Summary History</CardTitle>
              <CardDescription>Your recent regulatory document summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Your summary history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

