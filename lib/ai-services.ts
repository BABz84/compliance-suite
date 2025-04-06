import { CLAUDE_API_KEY, CLAUDE_API_URL, CLAUDE_MODEL, isDevelopment } from './config'

// Interface for AI message structure
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Interface for Claude API response
interface ClaudeResponse {
  id: string
  type: string
  role: string
  content: Array<{
    type: string
    text: string
  }>
  model: string
  stop_reason: string
  stop_sequence: string | null
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

// Main interface for AI calls
export async function getAIResponse(
  messages: Message[],
  options?: {
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }
) {
  // In development mode or when no API key is available, use mock responses
  if (isDevelopment || !CLAUDE_API_KEY) {
    return getMockAIResponse(messages, options)
  }
  
  try {
    // Format the messages for Claude API
    const claudeMessages = [...messages]
    
    // Add system prompt if provided
    if (options?.systemPrompt) {
      claudeMessages.unshift({
        role: 'system',
        content: options.systemPrompt
      })
    }
    
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        messages: claudeMessages,
        max_tokens: options?.maxTokens || 4000,
        temperature: options?.temperature || 0.7
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI API error (${response.status}): ${errorText}`)
    }
    
    const result = await response.json() as ClaudeResponse
    
    // Extract text content from Claude's response
    return {
      response: result.content[0]?.text || '',
      usage: result.usage,
      model: result.model,
      id: result.id
    }
  } catch (error) {
    console.error('Error calling AI service:', error)
    throw new Error(`Failed to get AI response: ${(error as Error).message}`)
  }
}

// Function to generate mock AI responses for development without API key
function getMockAIResponse(
  messages: Message[],
  options?: {
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }
) {
  // Get the last user message as the query
  const userQuery = messages.filter(m => m.role === 'user').pop()?.content || ''
  const mockResponses: Record<string, string> = {
    regulatory: `Based on my analysis of the regulatory framework, here are the key points:

1. The requirements you're asking about are primarily covered in Article 17 of GDPR.
2. Organizations must implement appropriate measures to ensure data security.
3. There is a 72-hour breach notification requirement.
4. Organizations must maintain records of processing activities.

This is particularly relevant for financial institutions, which must balance these requirements with other regulatory obligations.`,
    
    contract: `I've reviewed the contract and identified several compliance issues:

1. Section 4.2: The data retention policy is too vague and doesn't specify clear timelines.
2. Section 7.1: The third-party sharing clause doesn't adequately detail the categories of recipients.
3. Section 12: The breach notification timeline exceeds regulatory requirements (7 days vs. 72 hours).

I recommend updating these sections to align with GDPR Article 5(1)(e) and CCPA Section 1798.100.`,
    
    summary: `This document outlines a comprehensive data protection policy.

Key points:
1. Data collection must have a lawful basis
2. Data retention periods are specified for different categories
3. Access controls follow least privilege principles
4. Regular audits are required quarterly
5. Breach notification procedures include 72-hour timeline

The policy addresses core compliance requirements for both GDPR and CCPA.`,
    
    comparison: `The documents have several similarities:
- Both require encryption for sensitive data
- Both mandate breach notification
- Both require data subject access procedures

Key differences:
- Document 1 requires notification within 72 hours while Document 2 allows 30 days
- Document 1 includes right to erasure while Document 2 does not
- Document 2 has more detailed technical requirements for encryption

Overall, Document 1 is more aligned with GDPR, while Document 2 follows a CCPA-like approach.`,
    
    policy: `# Data Protection Policy

## Purpose
This policy establishes guidelines for handling personal data in compliance with relevant regulations.

## Scope
This policy applies to all employees and contractors with access to personal data.

## Requirements
1. All data collection must have a documented lawful basis
2. Personal data must be retained only as long as necessary
3. Access to personal data must be limited to authorized personnel
4. All personal data must be encrypted at rest and in transit
5. Regular training must be conducted for all personnel

## Implementation
Department heads are responsible for ensuring compliance within their teams.`,
    
    control: `Control: Data Access Management

Type: Preventive
Category: Data Protection

This control ensures proper authorization for data access by:
1. Implementing role-based access control
2. Requiring periodic access reviews
3. Maintaining audit logs of access attempts
4. Enforcing multi-factor authentication for sensitive data
5. Automating account provisioning and deprovisioning

Testing involves quarterly access reviews and automated monitoring of violation attempts.`,
    
    alignment: `Compliance Gap Analysis:

Overall Compliance Score: 78%

Strong Areas:
- Data security controls (85% compliance)
- Incident response procedures (82% compliance)

Gap Areas:
- Breach notification timeline (60% compliance)
- International data transfers (45% compliance)

Recommendations:
1. Update breach notification procedure to meet 72-hour requirement
2. Implement transfer impact assessments for international data flows
3. Enhance documentation of data processing activities
4. Update privacy notices to include all required disclosures`
  }
  
  // Determine which mock response to use based on the query
  let responseType = 'regulatory'
  
  if (userQuery.toLowerCase().includes('contract')) {
    responseType = 'contract'
  } else if (userQuery.toLowerCase().includes('summarize') || userQuery.toLowerCase().includes('summary')) {
    responseType = 'summary'
  } else if (userQuery.toLowerCase().includes('compare') || userQuery.toLowerCase().includes('comparison')) {
    responseType = 'comparison'
  } else if (userQuery.toLowerCase().includes('policy') && userQuery.toLowerCase().includes('draft')) {
    responseType = 'policy'
  } else if (userQuery.toLowerCase().includes('control')) {
    responseType = 'control'
  } else if (userQuery.toLowerCase().includes('gap') || userQuery.toLowerCase().includes('alignment')) {
    responseType = 'alignment'
  }
  
  return {
    response: mockResponses[responseType],
    usage: { input_tokens: 250, output_tokens: 350 },
    model: "mock-claude-3",
    id: `mock-${Date.now()}`
  }
} 