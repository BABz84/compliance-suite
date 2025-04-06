"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDocumentStore, useUIState, Document } from "@/lib/store"
import { FileText, File, FileCode, FileSpreadsheet, FileQuestion } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DocumentListProps {
  maxHeight?: string
  documentType?: string
  title?: string
}

export function DocumentList({ 
  maxHeight = "400px",
  documentType = "all",
  title = "Documents"
}: DocumentListProps) {
  const { filteredDocuments, setDocumentTypeFilter } = useDocumentStore()
  const { getLastEventTime } = useUIState()
  const [refreshTrigger, setRefreshTrigger] = useState<Date | null>(null)
  
  // Listen for document-added events
  useEffect(() => {
    const lastUploadTime = getLastEventTime('document-added')
    if (lastUploadTime) {
      setRefreshTrigger(lastUploadTime)
    }
  }, [getLastEventTime('document-added')])
  
  // Apply document type filter if specified
  useEffect(() => {
    if (documentType !== 'all') {
      setDocumentTypeFilter(documentType as any)
    }
  }, [documentType, setDocumentTypeFilter])
  
  // If refreshTrigger updates, this effect will re-run
  useEffect(() => {
    if (refreshTrigger) {
      // In a real app, you might refetch data from an API here
      console.log('Refreshing document list', refreshTrigger)
    }
  }, [refreshTrigger])
  
  const getDocumentIcon = (doc: Document) => {
    switch (doc.type) {
      case 'contract':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'regulation':
        return <FileCode className="h-4 w-4 text-purple-500" />
      case 'policy':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`h-[${maxHeight}]`}>
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-sm text-muted-foreground">No documents found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="flex items-start space-x-3 p-3 rounded-md border">
                  {getDocumentIcon(doc)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {doc.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 