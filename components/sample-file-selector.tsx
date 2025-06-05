"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink } from "lucide-react"
import { sampleFiles, SampleFile } from "@/lib/sample-data"
import { useLanguage } from "@/contexts/language-context"

interface SampleFileSelectorProps {
  selectedFile: string
  selectedFileData: SampleFile | null
  onFileSelect: (fileName: string) => void
  className?: string
}

export function SampleFileSelector({ 
  selectedFile, 
  selectedFileData, 
  onFileSelect, 
  className = "" 
}: SampleFileSelectorProps) {
  const { t } = useLanguage();
  
  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-base font-medium">{t("sampleFiles.title")}</Label>
      <Select value={selectedFile} onValueChange={onFileSelect}>
        <SelectTrigger className="border-gray-300">
          <SelectValue placeholder={t("sampleFiles.placeholder")} />
        </SelectTrigger>
        <SelectContent>
          {sampleFiles.map((file, index) => (
            <SelectItem key={index} value={file.name}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">{file.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedFileData && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{selectedFileData.name}</p>
            <a
              href={selectedFileData.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-gray-600">{selectedFileData.description}</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>Size: {selectedFileData.size}</span>
            <span>Pages: {selectedFileData.pages}</span>
          </div>
        </div>
      )}
    </div>
  )
} 