"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SmeFeedback } from "@/components/shared/sme-feedback"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample control frameworks
const frameworks = [
  { value: "nist-csf", label: "NIST Cybersecurity Framework" },
  { value: "iso-27001", label: "ISO 27001" },
  { value: "pci-dss", label: "PCI DSS" },
  { value: "hipaa", label: "HIPAA" },
  { value: "gdpr", label: "GDPR" },
  { value: "sox", label: "Sarbanes-Oxley (SOX)" },
]

// Sample risk levels
const riskLevels = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

export default function ControlDesignPage() {
  const [framework, setFramework] = useState("")
  const [riskLevel, setRiskLevel] = useState("")
  const [businessContext, setBusinessContext] = useState("")
  const [existingControls, setExistingControls] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [controls, setControls] = useState<any[] | null>(null)
  const [controlsId, setControlsId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!framework || !riskLevel || !businessContext) {
      return
    }

    setIsLoading(true)
    setControls(null)

    // Simulate AI control generation
    setTimeout(() => {
      const sampleControls = [
        {
          id: "control-1",
          title: "Multi-Factor Authentication (MFA)",
          description:
            "Implement multi-factor authentication for all user access to systems containing sensitive data.",
          implementation:
            "Deploy an MFA solution that requires at least two forms of authentication (something you know, something you have, something you are) for all administrative access and access to systems containing sensitive data.",
          framework: "NIST CSF (PR.AC-7)",
          effectiveness: "High",
          cost: "Medium",
          complexity: "Medium",
        },
        {
          id: "control-2",
          title: "Data Encryption at Rest",
          description: "Encrypt all sensitive data when stored in databases, file systems, or backup media.",
          implementation:
            "Implement AES-256 encryption for all databases containing sensitive information. Use transparent database encryption where possible, and file-level encryption for unstructured data.",
          framework: "NIST CSF (PR.DS-1)",
          effectiveness: "High",
          cost: "Medium",
          complexity: "Medium",
        },
        {
          id: "control-3",
          title: "Security Awareness Training",
          description: "Provide regular security awareness training to all employees with access to sensitive data.",
          implementation:
            "Develop and deliver quarterly security awareness training covering data handling, phishing recognition, password security, and incident reporting. Include role-specific modules for employees with access to highly sensitive data.",
          framework: "NIST CSF (PR.AT-1)",
          effectiveness: "Medium",
          cost: "Low",
          complexity: "Low",
        },
        {
          id: "control-4",
          title: "Data Loss Prevention (DLP)",
          description: "Implement DLP solutions to prevent unauthorized transmission of sensitive data.",
          implementation:
            "Deploy DLP software that monitors and blocks unauthorized transmission of sensitive data through email, web uploads, and removable media. Configure policies based on data classification and regulatory requirements.",
          framework: "NIST CSF (PR.DS-5)",
          effectiveness: "High",
          cost: "High",
          complexity: "High",
        },
        {
          id: "control-5",
          title: "Access Review Process",
          description: "Establish a regular access review process to validate appropriate access to sensitive data.",
          implementation:
            "Implement quarterly access reviews where system owners and managers validate user access rights. Automate the review process where possible, with clear workflows for approvals and revocations.",
          framework: "NIST CSF (PR.AC-4)",
          effectiveness: "Medium",
          cost: "Low",
          complexity: "Medium",
        },
      ]

      setControls(sampleControls)
      setControlsId(`controls-${Date.now()}`)
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Control Design</h1>
        <p className="text-muted-foreground">Generate tailored security and compliance controls</p>
      </div>

      <Tabs defaultValue="design">
        <TabsList>
          <TabsTrigger value="design">Design Controls</TabsTrigger>
          <TabsTrigger value="history">Design History</TabsTrigger>
        </TabsList>
        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Control Requirements</CardTitle>
              <CardDescription>Provide context to generate appropriate controls</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="framework">Control Framework</Label>
                    <Select value={framework} onValueChange={setFramework} required>
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

                  <div className="space-y-2">
                    <Label htmlFor="risk-level">Risk Level</Label>
                    <Select value={riskLevel} onValueChange={setRiskLevel} required>
                      <SelectTrigger id="risk-level">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        {riskLevels.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-context">Business Context</Label>
                  <Textarea
                    id="business-context"
                    placeholder="Describe the business process, data types, and systems that need controls..."
                    value={businessContext}
                    onChange={(e) => setBusinessContext(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existing-controls">Existing Controls (Optional)</Label>
                  <Textarea
                    id="existing-controls"
                    placeholder="Describe any existing controls already in place..."
                    value={existingControls}
                    onChange={(e) => setExistingControls(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={!framework || !riskLevel || !businessContext || isLoading}
                  className="ml-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Controls"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2 border rounded-lg p-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex space-x-4 mt-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {controls && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recommended Controls</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {controls.map((control: any) => (
                      <div key={control.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-lg">{control.title}</h3>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-2">{control.description}</p>
                          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-sm">
                            <p className="font-medium mb-1">Implementation Guidance:</p>
                            <p>{control.implementation}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {control.framework}
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 text-xs px-2 py-1 rounded-full">
                            Effectiveness: {control.effectiveness}
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 text-xs px-2 py-1 rounded-full">
                            Cost: {control.cost}
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 text-xs px-2 py-1 rounded-full">
                            Complexity: {control.complexity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {controlsId && <SmeFeedback contentId={controlsId} contentType="control-design" />}
            </>
          )}
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Design History</CardTitle>
              <CardDescription>Your recent control design sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Your control design history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

