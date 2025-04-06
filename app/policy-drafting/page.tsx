"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Save, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SmeFeedback } from "@/components/shared/sme-feedback"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample policy types
const policyTypes = [
  { value: "data-privacy", label: "Data Privacy Policy" },
  { value: "data-retention", label: "Data Retention Policy" },
  { value: "acceptable-use", label: "Acceptable Use Policy" },
  { value: "information-security", label: "Information Security Policy" },
  { value: "incident-response", label: "Incident Response Policy" },
  { value: "code-of-conduct", label: "Code of Conduct" },
  { value: "whistleblower", label: "Whistleblower Policy" },
]

// Sample jurisdictions
const jurisdictions = [
  { value: "global", label: "Global" },
  { value: "eu", label: "European Union" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
]

// Sample industries
const industries = [
  { value: "financial", label: "Financial Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "technology", label: "Technology" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "education", label: "Education" },
  { value: "government", label: "Government" },
]

export default function PolicyDraftingPage() {
  const [policyType, setPolicyType] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [industry, setIndustry] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [specificRequirements, setSpecificRequirements] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [policyDraft, setPolicyDraft] = useState<string | null>(null)
  const [policyId, setPolicyId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!policyType || !jurisdiction || !industry || !companyName) {
      return
    }

    setIsLoading(true)
    setPolicyDraft(null)

    // Simulate AI policy generation
    setTimeout(() => {
      const samplePolicyDraft = `# DATA PRIVACY POLICY

## 1. INTRODUCTION

### 1.1 Purpose
This Data Privacy Policy ("Policy") describes how Acme Financial Services ("Acme," "we," "us," or "our") collects, uses, shares, and protects personal information. This Policy applies to all personal information processed by us, regardless of the medium in which the information is stored.

### 1.2 Scope
This Policy applies to all employees, contractors, consultants, temporary workers, and other workers at Acme, including all personnel affiliated with third parties who process personal information on Acme's behalf.

### 1.3 Definitions
- **Personal Information**: Any information relating to an identified or identifiable natural person ('data subject').
- **Processing**: Any operation performed on personal information, whether or not by automated means.
- **Data Controller**: The entity that determines the purposes and means of processing personal information.
- **Data Processor**: The entity that processes personal information on behalf of the Data Controller.

## 2. PRIVACY PRINCIPLES

Acme adheres to the following principles regarding personal information:

### 2.1 Lawfulness, Fairness, and Transparency
We process personal information lawfully, fairly, and in a transparent manner.

### 2.2 Purpose Limitation
We collect personal information for specified, explicit, and legitimate purposes and do not process it in a manner incompatible with those purposes.

### 2.3 Data Minimization
We limit personal information collection to what is necessary in relation to the purposes for which it is processed.

### 2.4 Accuracy
We take reasonable steps to ensure personal information is accurate and, where necessary, kept up to date.

### 2.5 Storage Limitation
We keep personal information in a form that permits identification of data subjects for no longer than necessary for the purposes for which it is processed.

### 2.6 Integrity and Confidentiality
We process personal information in a manner that ensures appropriate security, including protection against unauthorized or unlawful processing and against accidental loss, destruction, or damage.

### 2.7 Accountability
We are responsible for and can demonstrate compliance with these principles.

## 3. COLLECTION OF PERSONAL INFORMATION

### 3.1 Types of Personal Information Collected
We may collect the following categories of personal information:
- Contact information (name, address, email address, phone number)
- Identification information (date of birth, social security number, government ID)
- Financial information (account numbers, transaction history, credit information)
- Employment information (employer, title, work history)
- Technical information (IP address, device information, browsing history)

### 3.2 Methods of Collection
We collect personal information through:
- Direct interactions with customers
- Our website and mobile applications
- Third-party sources (credit bureaus, public databases)
- Automated technologies (cookies, web beacons)

### 3.3 Legal Basis for Processing
We process personal information based on one or more of the following legal bases:
- Consent of the data subject
- Performance of a contract
- Compliance with a legal obligation
- Protection of vital interests
- Public interest or exercise of official authority
- Legitimate interests pursued by Acme or a third party

## 4. USE OF PERSONAL INFORMATION

### 4.1 Primary Purposes
We use personal information to:
- Provide financial products and services
- Process transactions and maintain accounts
- Verify customer identity and prevent fraud
- Comply with legal and regulatory requirements
- Communicate with customers about their accounts

### 4.2 Secondary Purposes
With appropriate consent or as permitted by law, we may also use personal information to:
- Market products and services
- Conduct research and analytics
- Improve our products, services, and customer experience

## 5. DISCLOSURE OF PERSONAL INFORMATION

### 5.1 Categories of Recipients
We may share personal information with:
- Service providers and vendors
- Financial partners (payment processors, credit bureaus)
- Legal and regulatory authorities
- Professional advisors (lawyers, auditors)
- Potential buyers in the event of a merger, acquisition, or sale

### 5.2 International Transfers
When we transfer personal information across borders, we implement appropriate safeguards in accordance with applicable law.

## 6. DATA SUBJECT RIGHTS

### 6.1 Rights Available
Depending on applicable law, data subjects may have the following rights:
- Access to personal information
- Rectification of inaccurate information
- Erasure of personal information
- Restriction of processing
- Data portability
- Objection to processing
- Withdrawal of consent
- Lodging a complaint with a supervisory authority

### 6.2 Exercise of Rights
To exercise these rights, data subjects may contact our Privacy Office at privacy@acmefinancial.com or call 1-800-PRIVACY.

## 7. DATA SECURITY

### 7.1 Security Measures
We implement appropriate technical and organizational measures to protect personal information, including:
- Encryption of sensitive data
- Access controls and authentication
- Regular security assessments
- Employee training
- Incident response procedures

### 7.2 Data Breach Notification
In the event of a data breach, we will notify affected individuals and relevant authorities as required by applicable law.

## 8. DATA RETENTION

We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, to comply with legal obligations, or to protect our legitimate interests.

## 9. COOKIES AND TRACKING TECHNOLOGIES

### 9.1 Use of Cookies
Our website uses cookies and similar technologies to enhance user experience, analyze usage, and assist in our marketing efforts.

### 9.2 Cookie Preferences
Users can manage cookie preferences through their browser settings or our cookie preference center.

## 10. CHILDREN'S PRIVACY

Our services are not directed to individuals under the age of 18, and we do not knowingly collect personal information from children.

## 11. CHANGES TO THIS POLICY

We may update this Policy periodically to reflect changes in our practices or legal requirements. We will notify data subjects of significant changes through appropriate channels.

## 12. CONTACT INFORMATION

For questions or concerns about this Policy or our privacy practices, please contact:

Privacy Office
Acme Financial Services
123 Main Street
New York, NY 10001
privacy@acmefinancial.com
1-800-PRIVACY

## 13. EFFECTIVE DATE

This Policy is effective as of January 1, 2024.`

      setPolicyDraft(samplePolicyDraft)
      setPolicyId(`policy-${Date.now()}`)
      setIsLoading(false)
    }, 3000)
  }

  const handleCopyToClipboard = () => {
    if (policyDraft) {
      navigator.clipboard.writeText(policyDraft)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Policy Drafting</h1>
        <p className="text-muted-foreground">Generate customized policy documents for your organization</p>
      </div>

      <Tabs defaultValue="draft">
        <TabsList>
          <TabsTrigger value="draft">Draft Policy</TabsTrigger>
          <TabsTrigger value="history">Policy History</TabsTrigger>
        </TabsList>
        <TabsContent value="draft" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Parameters</CardTitle>
              <CardDescription>Provide details to generate a customized policy</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="policy-type">Policy Type</Label>
                    <Select value={policyType} onValueChange={setPolicyType} required>
                      <SelectTrigger id="policy-type">
                        <SelectValue placeholder="Select policy type" />
                      </SelectTrigger>
                      <SelectContent>
                        {policyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jurisdiction">Jurisdiction</Label>
                    <Select value={jurisdiction} onValueChange={setJurisdiction} required>
                      <SelectTrigger id="jurisdiction">
                        <SelectValue placeholder="Select jurisdiction" />
                      </SelectTrigger>
                      <SelectContent>
                        {jurisdictions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry} required>
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      placeholder="Enter your company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Specific Requirements (Optional)</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Enter any specific requirements or considerations for this policy..."
                    value={specificRequirements}
                    onChange={(e) => setSpecificRequirements(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={!policyType || !jurisdiction || !industry || !companyName || isLoading}
                  className="ml-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Policy"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Policy Draft</CardTitle>
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

          {policyDraft && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Policy Draft</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-line">{policyDraft}</div>
                  </div>
                </CardContent>
              </Card>

              {policyId && <SmeFeedback contentId={policyId} contentType="policy-draft" />}
            </>
          )}
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Policy History</CardTitle>
              <CardDescription>Your recent policy drafts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Your policy drafting history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

