"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FileText, Eye } from "lucide-react"
import { SampleFile } from "@/lib/sample-data"

interface PdfPreviewProps {
  title: string
  selectedFileData: SampleFile | null
  className?: string
  showViewButton?: boolean
}

export function PdfPreview({ 
  title, 
  selectedFileData, 
  className = "",
  showViewButton = true 
}: PdfPreviewProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-base font-medium">{title}</Label>
      <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        {selectedFileData ? (
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">{selectedFileData.name}</p>
            <p className="text-xs text-gray-500">
              {selectedFileData.pages} pages • {selectedFileData.size}
            </p>
            {showViewButton && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open(selectedFileData.path, "_blank")}
              >
                <Eye className="w-4 h-4 mr-1" />
                View PDF
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <Eye className="w-8 h-8 mx-auto mb-2" />
            <p>Select a file to preview</p>
          </div>
        )}
      </div>
    </div>
  )
} 