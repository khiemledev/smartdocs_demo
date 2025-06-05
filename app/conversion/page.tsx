"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileOutput, Download, FileText, Eye, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { PageHeader } from "@/components/page-header"
import { FileUpload } from "@/components/file-upload"
import { SampleFileSelector } from "@/components/sample-file-selector"
import { PdfPreview } from "@/components/pdf-preview"
import { Footer } from "@/components/footer"
import { sampleFiles, SampleFile } from "@/lib/sample-data"
import { apiClient } from "@/lib/api"
import { useLanguage } from "@/contexts/language-context"

export default function ConversionPage() {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState("")
  const [selectedFileData, setSelectedFileData] = useState<SampleFile | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [showConverted, setShowConverted] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null)
  const [convertedFileName, setConvertedFileName] = useState<string | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName)
    const fileData = sampleFiles.find((f) => f.name === fileName)
    setSelectedFileData(fileData || null)
    setShowConverted(false)
    setUploadedFile(null)
    setError(null)
    setConvertedFileUrl(null)
    setConvertedFileName(null)
    if (uploadedFileUrl) {
      URL.revokeObjectURL(uploadedFileUrl)
    }
    setUploadedFileUrl(null)
  }

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setSelectedFile("")
    setSelectedFileData(null)
    setShowConverted(false)
    setError(null)
    setConvertedFileUrl(null)
    setConvertedFileName(null)
    
    // Create blob URL for uploaded file preview
    const fileUrl = URL.createObjectURL(file)
    setUploadedFileUrl(fileUrl)
  }

  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await apiClient.get('/ocr_extract_status', {
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
          setIsConverting(false)
          setError(data.error || "Conversion failed")
          setTaskId(null)
        } else {
          // Unknown status, continue polling
          setTimeout(() => pollTaskStatus(taskId), 2000)
        }
      } else {
        // Response is binary - file is ready
        const contentDisposition = response.headers['content-disposition']
        let filename = 'converted-document.docx'
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        // Create blob URL for the converted file
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        })
        const fileUrl = URL.createObjectURL(blob)
        
        setConvertedFileUrl(fileUrl)
        setConvertedFileName(filename)
        setIsConverting(false)
        setShowConverted(true)
        setTaskId(null)
      }
    } catch (err) {
      setIsConverting(false)
      setError("Failed to check conversion status")
      setTaskId(null)
    }
  }

  const handleConvert = async () => {
    if (!uploadedFile && !selectedFileData) {
      setError(t("conversion.pleaseSelectFile"))
      return
    }

    setIsConverting(true)
    setError(null)
    setShowConverted(false)

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

      const response = await apiClient.post('/ocr_extract', formData, {
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
      setIsConverting(false)
      setError(err instanceof Error ? err.message : "Failed to start conversion")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <PageHeader 
        title={t("conversion.pageTitle")}
        description={t("conversion.pageDescription")}
        icon={FileOutput}
      />

      <main className="container mx-auto px-4 py-8">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <FileOutput className="w-5 h-5" />
              {t("conversion.cardTitle")}
            </CardTitle>
            <CardDescription>
              {t("conversion.cardDescription")}
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
                <source src="/videos/pdf_to_doc.mp4" type="video/mp4" />
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
                        setShowConverted(false)
                        setError(null)
                        if (convertedFileUrl) {
                          URL.revokeObjectURL(convertedFileUrl)
                        }
                        setConvertedFileUrl(null)
                        setConvertedFileName(null)
                        if (uploadedFileUrl) {
                          URL.revokeObjectURL(uploadedFileUrl)
                        }
                        setUploadedFileUrl(null)
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

            {/* Preview Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-base font-medium">{t("conversion.originalPdfPreview")}</div>
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
                              <div className="space-y-2">
                  <div className="text-base font-medium">{t("conversion.convertedWordPreview")}</div>
                  <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    {showConverted && convertedFileUrl && convertedFileName ? (
                      <div className="w-full h-full flex flex-col">
                        {/* Word Document Preview */}
                        <div className="flex-1 bg-white rounded-t border-b relative">
                          {/* Document preview area */}
                          <div className="w-full h-full bg-white flex items-center justify-center p-4">
                            <div className="text-center">
                              <div className="w-16 h-20 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-white" />
                              </div>
                              <p className="text-sm text-gray-800 font-medium mb-1">
                                {convertedFileName}
                              </p>
                              <p className="text-xs text-green-600 mb-3">
                                ✓ {t("conversion.conversionCompleted")}
                              </p>
                              <p className="text-xs text-gray-500 mb-3">
                                {t("conversion.wordDocumentReady")}
                              </p>
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = convertedFileUrl
                                    link.download = convertedFileName
                                    link.click()
                                  }}
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  {t("common.download")}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(convertedFileUrl, '_blank')}
                                  className="border-green-200 text-green-700 hover:bg-green-50"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  {t("common.open")}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Bar */}
                        <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-between">
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">{convertedFileName}</span>
                            <span className="ml-2 text-green-600">✓ {t("conversion.converted")}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = convertedFileUrl
                                link.download = convertedFileName
                                link.click()
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              {t("common.download")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(convertedFileUrl, '_blank')}
                              className="h-6 px-2 text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              {t("common.open")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2" />
                          <p>{t("conversion.wordDocumentPreview")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            <div className="flex gap-4">
              <Button 
                className="flex-1 bg-black hover:bg-gray-800 text-white" 
                disabled={(!selectedFile && !uploadedFile) || isConverting}
                onClick={handleConvert}
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {taskId ? t("conversion.converting") : t("conversion.startingConversion")}
                  </>
                ) : (
                  t("conversion.convertButton")
                )}
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={!showConverted || !convertedFileUrl}
                onClick={() => {
                  if (convertedFileUrl && convertedFileName) {
                    const link = document.createElement('a')
                    link.href = convertedFileUrl
                    link.download = convertedFileName
                    link.click()
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                {t("common.download")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
} 