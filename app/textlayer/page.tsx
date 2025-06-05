"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Layers, Download, FileText, Eye, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { PageHeader } from "@/components/page-header"
import { FileUpload } from "@/components/file-upload"
import { SampleFileSelector } from "@/components/sample-file-selector"
import { PdfPreview } from "@/components/pdf-preview"
import { Footer } from "@/components/footer"
import { sampleFiles, SampleFile } from "@/lib/sample-data"
import { apiClient } from "@/lib/api"
import { useLanguage } from "@/contexts/language-context"

export default function TextLayerPage() {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState("")
  const [selectedFileData, setSelectedFileData] = useState<SampleFile | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEnhanced, setShowEnhanced] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [enhancedFileUrl, setEnhancedFileUrl] = useState<string | null>(null)
  const [enhancedFileName, setEnhancedFileName] = useState<string | null>(null)

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName)
    const fileData = sampleFiles.find((f) => f.name === fileName)
    setSelectedFileData(fileData || null)
    setShowEnhanced(false)
    setUploadedFile(null)
    setError(null)
    if (uploadedFileUrl) {
      URL.revokeObjectURL(uploadedFileUrl)
    }
    setUploadedFileUrl(null)
  }

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setSelectedFile("")
    setSelectedFileData(null)
    setShowEnhanced(false)
    setError(null)
    
    // Create blob URL for uploaded file preview
    const fileUrl = URL.createObjectURL(file)
    setUploadedFileUrl(fileUrl)
  }

  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await apiClient.get('/textlayer_extract_status', {
        params: { task_id: taskId },
        responseType: 'blob', // Handle both JSON and binary responses
      })

      // Check if the response is JSON (error/pending) or binary (completed)
      const contentType = response.headers['content-type']
      
      if (contentType && contentType.includes('application/json')) {
        // Response is JSON - either pending or error
        const text = await response.data.text()
        const data = JSON.parse(text)
        
        if (data.status === "PENDING") {
          // Still processing, continue polling
          setTimeout(() => pollTaskStatus(taskId), 2000)
        } else if (data.error) {
          // Failed
          setIsProcessing(false)
          setError(data.error || "Text layer addition failed")
          setTaskId(null)
        } else {
          // Unknown status, continue polling
          setTimeout(() => pollTaskStatus(taskId), 2000)
        }
      } else {
        // Response is binary - enhanced PDF is ready
        const contentDisposition = response.headers['content-disposition']
        let filename = 'enhanced-document.pdf'
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        // Create blob URL for the enhanced PDF
        const blob = new Blob([response.data], { 
          type: 'application/pdf' 
        })
        const fileUrl = URL.createObjectURL(blob)
        
        setEnhancedFileUrl(fileUrl)
        setEnhancedFileName(filename)
        setIsProcessing(false)
        setShowEnhanced(true)
        setTaskId(null)
      }
    } catch (err) {
      setIsProcessing(false)
      setError("Failed to check processing status")
      setTaskId(null)
    }
  }

  const handleAddTextLayer = async () => {
    if (!uploadedFile && !selectedFileData) {
      setError(t("textlayer.pleaseSelectFile"))
      return
    }

    setIsProcessing(true)
    setError(null)
    setShowEnhanced(false)

    try {
      const formData = new FormData()
      
      if (uploadedFile) {
        formData.append("binary_file", uploadedFile)
      } else if (selectedFileData) {
        // For demo purposes, we'll use a fetch to get the sample file
        const fileResponse = await fetch(selectedFileData.path)
        const fileBlob = await fileResponse.blob()
        formData.append("binary_file", fileBlob, selectedFileData.name)
      }

      const response = await apiClient.post('/textlayer_extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const data = response.data
      
      if (data.task_id) {
        setTaskId(data.task_id)
        pollTaskStatus(data.task_id)
      } else {
        throw new Error("No task ID received")
      }
    } catch (err) {
      setIsProcessing(false)
      setError(err instanceof Error ? err.message : "Failed to start text layer addition")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <PageHeader 
        title={t("textlayer.pageTitle")}
        description={t("textlayer.pageDescription")}
        icon={Layers}
      />

      <main className="container mx-auto px-4 py-8">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Layers className="w-5 h-5" />
              {t("textlayer.cardTitle")}
            </CardTitle>
            <CardDescription>
              {t("textlayer.cardDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Demo Video */}
            <div className="flex justify-center">
              <video 
                width={600} 
                height={300}
                autoPlay
                loop
                muted
                className="rounded-lg border border-gray-200 shadow-sm"
              >
                <source src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/add_textlayer.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* File Selection Section */}
            {!uploadedFile && !selectedFileData ? (
              <div className="grid md:grid-cols-2 gap-6">
                <FileUpload onFileSelect={handleFileUpload} />
                <SampleFileSelector 
                  selectedFile={selectedFile}
                  selectedFileData={selectedFileData}
                  onFileSelect={handleFileSelect}
                />
              </div>
            ) : (
              <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {uploadedFile ? uploadedFile.name : selectedFileData?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {uploadedFile ? (
                          `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                        ) : (
                          `${selectedFileData?.size} • ${selectedFileData?.pages} pages`
                        )}
                      </p>
                      {selectedFileData && (
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedFileData.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedFileData && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedFileData.path, "_blank")}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t("common.preview")}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null)
                        setSelectedFile("")
                        setSelectedFileData(null)
                        setShowEnhanced(false)
                        setError(null)
                        if (uploadedFileUrl) {
                          URL.revokeObjectURL(uploadedFileUrl)
                        }
                        setUploadedFileUrl(null)
                        if (enhancedFileUrl) {
                          URL.revokeObjectURL(enhancedFileUrl)
                        }
                        setEnhancedFileUrl(null)
                        setEnhancedFileName(null)
                      }}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t("common.clear")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Status Indicators */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                    {t("textlayer.before")}
                  </Badge>
                  <span className="text-sm font-medium">{t("textlayer.originalPdf")}</span>
                </div>
                <p className="text-sm text-gray-600">{t("textlayer.imageBasedContent")}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-black text-white">{t("textlayer.after")}</Badge>
                  <span className="text-sm font-medium">{t("textlayer.enhancedPdf")}</span>
                </div>
                <p className="text-sm text-gray-700">{t("textlayer.searchableTextLayer")}</p>
              </div>
            </div>

            {/* Preview Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Original PDF Preview */}
              <div className="space-y-2">
                <div className="text-base font-medium">{t("textlayer.originalPdfPreview")}</div>
                <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  {(uploadedFile && uploadedFileUrl) || selectedFileData ? (
                    <iframe
                      src={`${uploadedFileUrl || selectedFileData?.path}#view=FitH&zoom=page-width`}
                      className="w-full h-full"
                      title="PDF Preview"
                    >
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">
                            {uploadedFile ? uploadedFile.name : selectedFileData?.name}
                          </p>
                          <p className="text-xs mt-1">
                            Your browser doesn't support PDF preview
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              const url = uploadedFileUrl || selectedFileData?.path
                              if (url) window.open(url, '_blank')
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Open PDF
                          </Button>
                        </div>
                      </div>
                    </iframe>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p>{t("common.selectFile")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Enhanced PDF Preview */}
              <div className="space-y-2">
                <div className="text-base font-medium">{t("textlayer.enhancedPdfPreview")}</div>
                <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  {showEnhanced && enhancedFileUrl && enhancedFileName ? (
                    <iframe
                      src={`${enhancedFileUrl}#view=FitH&zoom=page-width`}
                      className="w-full h-full"
                      title="Enhanced PDF Preview"
                    >
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">{enhancedFileName}</p>
                          <p className="text-xs mt-1">Enhanced PDF with text layer</p>
                        </div>
                      </div>
                    </iframe>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p>{t("textlayer.enhancedPdfWillAppear")}</p>
                        {showEnhanced && (
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <Badge className="bg-green-100 text-green-700 text-xs">{t("textlayer.searchable")}</Badge>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">{t("textlayer.ocrComplete")}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                className="flex-1 bg-black hover:bg-gray-800 text-white" 
                disabled={(!selectedFile && !uploadedFile) || isProcessing}
                onClick={handleAddTextLayer}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {taskId ? t("textlayer.addingTextLayer") : t("textlayer.startingProcessing")}
                  </>
                ) : (
                  t("textlayer.addTextLayerButton")
                )}
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={!showEnhanced || !enhancedFileUrl}
                onClick={() => {
                  if (enhancedFileUrl && enhancedFileName) {
                    const link = document.createElement('a')
                    link.href = enhancedFileUrl
                    link.download = enhancedFileName
                    link.click()
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                {t("textlayer.downloadEnhancedPdf")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
} 