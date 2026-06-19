// ImgBB API endpoint
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload'
// API key from environment variables
const API_KEY = import.meta.env.VITE_IMGBB_API_KEY

/**
 * Uploads an image file to ImgBB and returns the direct display URL.
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} The direct URL to the uploaded image
 */
export const uploadToImgBB = async (imageFile) => {
  if (!imageFile) throw new Error('No image file provided')

  const formData = new FormData()
  formData.append('image', imageFile)

  try {
    const response = await fetch(`${IMGBB_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (data.success) {
      return data.data.display_url
    } else {
      throw new Error(data.error?.message || 'Failed to upload image')
    }
  } catch (error) {
    console.error('ImgBB upload error:', error)
    throw new Error('Failed to upload image to ImgBB')
  }
}
