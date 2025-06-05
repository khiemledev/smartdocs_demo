"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Database, Download, Loader2, FileText, Eye, X } from "lucide-react"
import Image from "next/image"
import { PageHeader } from "@/components/page-header"
import { FileUpload } from "@/components/file-upload"
import { SampleFileSelector } from "@/components/sample-file-selector"
import { Footer } from "@/components/footer"
import { sampleFiles, SampleFile } from "@/lib/sample-data"
import { apiClient } from "@/lib/api"
import { useLanguage } from "@/contexts/language-context"

export default function ExtractionPage() {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState("")
  const [selectedFileData, setSelectedFileData] = useState<SampleFile | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [threshold, setThreshold] = useState([0.5])
  const [useCorrector, setUseCorrector] = useState(true)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [extractionResults, setExtractionResults] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName)
    const fileData = sampleFiles.find((f) => f.name === fileName)
    setSelectedFileData(fileData || null)
    setShowResults(false)
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
    setShowResults(false)
    setError(null)
    
    // Create blob URL for uploaded file preview
    const fileUrl = URL.createObjectURL(file)
    setUploadedFileUrl(fileUrl)
  }

  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await apiClient.get('/info_extract_status', {
        params: { task_id: taskId }
      })
      const data = response.data
      
      if (data.status === "PENDING") {
        // Still processing, continue polling
        setTimeout(() => pollTaskStatus(taskId), 2000)
      } else if (data.info) {
        // Completed - has info field
        setIsProcessing(false)
        setExtractionResults(data.info)
        setShowResults(true)
        setTaskId(null)
      } else if (data.error) {
        // Failed
        setIsProcessing(false)
        setError(data.error || "Extraction failed")
        setTaskId(null)
      } else {
        // Unknown status, continue polling with limit
        setTimeout(() => pollTaskStatus(taskId), 2000)
      }
    } catch (err) {
      setIsProcessing(false)
      setError("Failed to check task status")
      setTaskId(null)
    }
  }

  const handleProcess = async () => {
    if (!uploadedFile && !selectedFileData) {
      setError(t("extraction.pleaseSelectFile"))
      return
    }

    setIsProcessing(true)
    setError(null)
    setShowResults(false)

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
      
      formData.append("threshold", threshold[0].toString())
      formData.append("use_corrector", useCorrector.toString())
      formData.append("mode", "administrative") // Fixed mode, not shown in UI

      const response = await apiClient.post('/info_extract', formData, {
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
      setError(err instanceof Error ? err.message : "Failed to start extraction")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <PageHeader 
        title={t("extraction.pageTitle")}
        description={t("extraction.pageDescription")}
        icon={Database}
      />

      <main className="container mx-auto px-4 py-8">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Database className="w-5 h-5" />
              {t("extraction.cardTitle")}
            </CardTitle>
            <CardDescription>
              {t("extraction.cardDescription")}
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
                <source src="/videos/info_extract.mp4" type="video/mp4" />
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
                        setShowResults(false)
                        setError(null)
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

            {/* Configuration Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">{t("extraction.threshold")}: {threshold[0]}</Label>
                <Slider
                  value={threshold}
                  onValueChange={setThreshold}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  {t("extraction.thresholdDescription")}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="corrector"
                    checked={useCorrector}
                    onCheckedChange={(checked) => setUseCorrector(checked === true)}
                  />
                  <Label htmlFor="corrector" className="text-base font-medium">
                    {t("extraction.useCorrector")}
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  {t("extraction.useCorrectorDescription")}
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              onClick={handleProcess}
              disabled={(!selectedFile && !uploadedFile) || isProcessing}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {taskId ? t("extraction.extracting") : t("extraction.startingExtraction")}
                </>
              ) : (
                t("extraction.extractButton")
              )}
            </Button>

            {/* Results Section */}
            {showResults && extractionResults && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-semibold text-gray-900">{t("extraction.resultsTitle")}</h3>
                
                {/* Two Column Layout: PDF Preview + Extracted Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left: Original PDF Preview */}
                  <div className="space-y-2">
                    <div className="text-base font-medium">{t("extraction.originalPdfPreview")}</div>
                    <div className="h-96 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
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
                            <p>PDF preview not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Extracted Information */}
                  <div className="space-y-2">
                    <div className="text-base font-medium">{t("extraction.extractedInformation")}</div>
                    <div className="h-96 bg-white rounded-lg border border-gray-200 overflow-auto">
                      <div className="p-4 space-y-3">
                        {Object.entries(extractionResults).map(([key, value]) => (
                          <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Label className="text-sm font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, ' ')}
                            </Label>
                            {typeof value === 'object' && value !== null && 'text' in value && 'conf' in value ? (
                              <div className="mt-1">
                                <p className="text-sm">{value.text}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">{t("extraction.confidence")}:</span>
                                  <span className="text-xs font-medium text-blue-600">{value.conf}%</span>
                                </div>
                              </div>
                            ) : Array.isArray(value) ? (
                              <div className="mt-1">
                                {value.map((item, index) => (
                                  <p key={index} className="text-sm">• {item}</p>
                                ))}
                              </div>
                            ) : typeof value === 'object' && value !== null ? (
                              <p className="text-sm mt-1">{JSON.stringify(value, null, 2)}</p>
                            ) : (
                              <p className="text-sm mt-1">{String(value) || 'N/A'}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    const dataStr = JSON.stringify(extractionResults, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = 'extraction-results.json'
                    link.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("extraction.downloadResults")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
} 