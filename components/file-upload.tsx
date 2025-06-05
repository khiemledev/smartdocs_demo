"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface FileUploadProps {
  onFileSelect?: (file: File) => void
  acceptedTypes?: string
  className?: string
}

export function FileUpload({ onFileSelect, acceptedTypes = ".pdf", className = "" }: FileUploadProps) {
  const { t } = useLanguage();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onFileSelect) {
      onFileSelect(file)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-base font-medium">{t("fileUpload.title")}</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">{t("fileUpload.dropText")}</p>
        <div className="relative">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            {t("fileUpload.browseFiles")}
          </Button>
          <input
            type="file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
} 