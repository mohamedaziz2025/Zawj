'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Upload, X, FileText, Image as ImageIcon, Check } from 'lucide-react'
import { uploadApi } from '@/lib/api/upload'

interface FileUploadProps {
  type: 'profile' | 'document' | 'evidence' | 'multiple'
  onUploadComplete?: (urls: string[]) => void
  accept?: string
  maxFiles?: number
  className?: string
}

export default function FileUpload({
  type,
  onUploadComplete,
  accept = 'image/*,application/pdf',
  maxFiles = 1,
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichier(s) autorisé(s)`)
      return
    }

    // Validate file sizes
    const maxSize = type === 'profile' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    const invalidFiles = selectedFiles.filter((file) => file.size > maxSize)
    
    if (invalidFiles.length > 0) {
      setError(`Taille maximale: ${maxSize / (1024 * 1024)}MB`)
      return
    }

    setError(null)
    setFiles([...files, ...selectedFiles])

    // Create previews for images
    selectedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      } else {
        setPreviews((prev) => [...prev, ''])
      }
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier')
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      let urls: string[] = []

      if (type === 'multiple' && files.length > 1) {
        const result = await uploadApi.uploadMultiple(files)
        urls = result.files.map((f) => f.url)
      } else {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          let result

          switch (type) {
            case 'profile':
              result = await uploadApi.uploadProfilePhoto(file)
              break
            case 'document':
              result = await uploadApi.uploadDocument(file, 'verification')
              break
            case 'evidence':
              result = await uploadApi.uploadEvidence(file)
              break
            case 'multiple':
              const multiResult = await uploadApi.uploadMultiple([file])
              result = multiResult.files[0]
              break
          }

          if (result) {
            urls.push(result.url)
          }
          
          setProgress(((i + 1) / files.length) * 100)
        }
      }

      setUploadedUrls(urls)
      onUploadComplete?.(urls)
      
      // Reset after successful upload
      setTimeout(() => {
        setFiles([])
        setPreviews([])
        setUploadedUrls([])
        setProgress(0)
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload area */}
      <div
        onClick={openFilePicker}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          uploading
            ? 'border-gray-600 bg-slate-800/50'
            : 'border-slate-600 hover:border-purple-500 bg-slate-800/30 hover:bg-slate-800/50'
        }`}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-white font-medium mb-2">
          Cliquez pour sélectionner {maxFiles > 1 ? 'des fichiers' : 'un fichier'}
        </p>
        <p className="text-sm text-gray-400">
          {type === 'profile'
            ? 'Images seulement (max 5MB)'
            : 'Images et PDF acceptés (max 10MB)'}
        </p>
        {maxFiles > 1 && (
          <p className="text-xs text-gray-500 mt-2">Maximum {maxFiles} fichiers</p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Selected files preview */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-medium">Fichiers sélectionnés:</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {previews[index] ? (
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : file.type.startsWith('image/') ? (
                  <ImageIcon className="h-12 w-12 text-purple-400" />
                ) : (
                  <FileText className="h-12 w-12 text-blue-400" />
                )}
                <div>
                  <p className="text-white text-sm">{file.name}</p>
                  <p className="text-gray-400 text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Upload en cours...</span>
            <span className="text-purple-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success message */}
      {uploadedUrls.length > 0 && !uploading && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-400" />
          <span className="text-green-400 text-sm">
            Fichier(s) uploadé(s) avec succès!
          </span>
        </div>
      )}

      {/* Upload button */}
      {files.length > 0 && !uploading && uploadedUrls.length === 0 && (
        <button
          onClick={handleUpload}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Uploader {files.length} fichier{files.length > 1 ? 's' : ''}
        </button>
      )}
    </div>
  )
}
