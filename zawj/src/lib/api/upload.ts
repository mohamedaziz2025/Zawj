import { api } from './client'

export interface UploadResponse {
  message: string
  url: string
  filename: string
  type?: string
}

export interface MultipleUploadResponse {
  message: string
  files: {
    url: string
    filename: string
    originalName: string
  }[]
}

export const uploadApi = {
  // Upload profile photo
  uploadProfilePhoto: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('photo', file)

    const response = await api.post('/api/upload/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload document
  uploadDocument: async (file: File, type?: string): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('document', file)
    if (type) {
      formData.append('type', type)
    }

    const response = await api.post('/api/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload evidence
  uploadEvidence: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('evidence', file)

    const response = await api.post('/api/upload/evidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload multiple files
  uploadMultiple: async (files: File[]): Promise<MultipleUploadResponse> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await api.post('/api/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
