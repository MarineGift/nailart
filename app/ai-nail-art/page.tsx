'use client'

import { useState } from 'react'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, Sparkles, Palette, Star, ArrowRight, Eye, Clock, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface NailAnalysis {
  nailShape: string
  nailCondition: string
  skinTone: string
  recommendations: {
    colors: string[]
    designs: string[]
    techniques: string[]
  }
  confidence: number
}

export default function AINailArtPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<NailAnalysis | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFiles(files)
      
      // Convert files to preview URLs
      const imageUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const url = URL.createObjectURL(files[i])
        imageUrls.push(url)
      }
      setUploadedImages(imageUrls)
    }
  }

  const simulateAIAnalysis = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select at least one image first')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisResults(null)

    // Simulate AI analysis progress
    const progressSteps = [
      { progress: 20, message: 'Processing image...' },
      { progress: 40, message: 'Analyzing nail shape...' },
      { progress: 60, message: 'Detecting skin tone...' },
      { progress: 80, message: 'Generating recommendations...' },
      { progress: 100, message: 'Analysis complete!' }
    ]

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setAnalysisProgress(step.progress)
    }

    // Generate realistic AI analysis results
    const mockResults: NailAnalysis = {
      nailShape: ['Oval', 'Square', 'Almond', 'Round', 'Coffin'][Math.floor(Math.random() * 5)],
      nailCondition: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
      skinTone: ['Warm', 'Cool', 'Neutral'][Math.floor(Math.random() * 3)],
      recommendations: {
        colors: ['Rose Gold', 'Nude Pink', 'Classic Red', 'Soft Lavender', 'Pearl White'],
        designs: ['French Manicure', 'Ombre Effect', 'Geometric Patterns', 'Floral Art', 'Minimalist Lines'],
        techniques: ['Gel Polish', 'Acrylic Extension', 'Nail Art Stamping', 'Hand-Painted Details']
      },
      confidence: Math.floor(Math.random() * 15) + 85 // 85-100%
    }

    setAnalysisResults(mockResults)
    setIsAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Hero Carousel Header - AI Nail Art Analysis */}
      <section className="-mt-0">
        <div className="relative overflow-hidden shadow-2xl">
          <div className="h-96 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 relative">
            <div className="absolute inset-0">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=1200&h=400&fit=crop)'
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300/30 via-purple-300/30 to-indigo-300/30"></div>
            </div>
            <div className="relative z-10 flex items-center justify-center h-full text-center px-8">
              <div>
                <div className="mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  AI Nail Art Analysis
                </h1>
                <p className="text-xl text-white/90 drop-shadow-md max-w-2xl mx-auto">
                  Upload photos and get personalized nail art recommendations with AI
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">🤖 95% Accuracy</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">⚡ 2 min Analysis</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">🎨 500+ Options</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photography Guide */}
      <section className="pt-16 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-8">Photography Guide</h2>
            
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-8">
              <div className="flex items-center">
                <span className="text-orange-500 mr-2">⚠️</span>
                <span className="font-medium text-orange-800">Please check the photography examples below.</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div>
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm text-gray-600">Four fingers, thumb</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Please take photos with the camera and send them.</p>
              </div>
              
              <div className="text-center">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div>
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm text-gray-600">Front view photo</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Take photos from the front so you can see clearly visible.</p>
              </div>
              
              <div className="text-center">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div>
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm text-gray-600">Reference card</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Please cover sensitive personal information.</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-blue-800 mb-4">For accurate nail shape measurement, please remove nail art before photographing</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold mr-2">✓</span>
                    <span className="font-medium text-green-800">Credit/Debit/Transit/Membership Cards</span>
                  </div>
                  <div className="flex">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2">VISA</div>
                    <div className="bg-green-600 text-white px-3 py-1 rounded text-sm">CARD</div>
                  </div>
                  <p className="text-xs text-green-700 mt-2">Used for proportional measurement. Please place next to your fingertips.</p>
                </div>
                
                <div className="bg-red-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold mr-2">✗</span>
                    <span className="font-medium text-red-800">Unmeasureable cards - Business cards, etc.</span>
                  </div>
                  <p className="text-xs text-red-700 mt-2">Why do I need a card?</p>
                  <p className="text-xs text-red-700">A reference card is needed to measure nail size. Our proprietary AI uses smart technology to measure your nail and recommend accurately.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Upload & Analysis Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Upload Your Nail Photos</h2>
            <p className="text-lg text-gray-600">Select multiple images for comprehensive AI analysis</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div>
              <Card className="border-2 border-dashed border-gray-300 hover:border-purple-300 transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Your Images</h3>
                    <p className="text-gray-600 mb-6">PNG, JPG up to 10MB each</p>
                  </div>
                  
                  <input 
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </label>
                  
                  {selectedFiles && (
                    <div className="mt-4 text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      {selectedFiles.length} file(s) selected
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {uploadedImages.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={url}
                            alt={`Nail photo ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Analysis Section */}
            <div>
              {!isAnalyzing && !analysisResults && (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center">
                    <Eye className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready for Analysis</h3>
                    <p className="text-gray-600 mb-6">Upload images and start AI analysis to get personalized recommendations</p>
                    <Button 
                      onClick={simulateAIAnalysis}
                      disabled={!selectedFiles || selectedFiles.length === 0}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start AI Analysis
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Progress */}
              {isAnalyzing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-purple-600" />
                      Analyzing Your Nails...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={analysisProgress} className="w-full" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{analysisProgress}%</div>
                        <p className="text-sm text-gray-600 mt-1">
                          {analysisProgress <= 20 ? 'Processing image...' :
                           analysisProgress <= 40 ? 'Analyzing nail shape...' :
                           analysisProgress <= 60 ? 'Detecting skin tone...' :
                           analysisProgress <= 80 ? 'Generating recommendations...' :
                           'Analysis complete!'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Results */}
              {analysisResults && (
                <Card className="border-purple-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="flex items-center text-purple-800">
                      <Sparkles className="h-5 w-5 mr-2" />
                      AI Analysis Results
                      <Badge className="ml-auto bg-green-100 text-green-700">
                        {analysisResults.confidence}% Confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Basic Analysis */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">Nail Shape</div>
                        <div className="text-lg font-bold text-purple-800">{analysisResults.nailShape}</div>
                      </div>
                      <div className="text-center p-3 bg-pink-50 rounded-lg">
                        <div className="text-sm text-pink-600 font-medium">Skin Tone</div>
                        <div className="text-lg font-bold text-pink-800">{analysisResults.skinTone}</div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <Palette className="h-4 w-4 mr-2" />
                          Recommended Colors
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResults.recommendations.colors.map((color, index) => (
                            <Badge key={index} variant="outline" className="bg-purple-50">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <Star className="h-4 w-4 mr-2" />
                          Design Suggestions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResults.recommendations.designs.map((design, index) => (
                            <Badge key={index} variant="outline" className="bg-pink-50">
                              {design}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-4 border-t">
                      <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Link href="/booking" className="flex items-center justify-center w-full">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setAnalysisResults(null)
                          setUploadedImages([])
                          setSelectedFiles(null)
                        }}
                      >
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}