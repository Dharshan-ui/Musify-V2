const buildContext = (context = {}) => (
  Object.entries(context)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${String(value).replaceAll('|', ' ').replaceAll('=', ':')}`)
    .join('|')
)

export async function uploadToCloudinary(file, options = {}) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary credentials not configured')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  if (options.folder) {
    formData.append('folder', options.folder)
  }

  if (options.publicId) {
    formData.append('public_id', options.publicId)
  }

  if (options.tags?.length) {
    formData.append('tags', options.tags.join(','))
  }

  const context = buildContext(options.context)

  if (context) {
    formData.append('context', context)
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Upload failed')
    }

    const data = await response.json()

    if (!data.secure_url) {
      throw new Error('No secure URL returned from Cloudinary')
    }

    return {
      secureUrl: data.secure_url,
      publicId: data.public_id,
      assetId: data.asset_id,
      resourceType: data.resource_type,
      format: data.format,
      bytes: data.bytes,
      duration: data.duration,
      originalFilename: data.original_filename
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}
