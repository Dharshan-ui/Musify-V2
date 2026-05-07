import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Image, Info, Plus } from 'lucide-react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import toast from 'react-hot-toast'
import { auth, db } from '../backend/firebase'
import { uploadToCloudinary } from '../utils/cloudinary'
import ProfileSidebar from './ProfileSidebar'

const UploadPhoto = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [uploading, setUploading] = useState(false)

  const selectFile = (selectedFile) => {
    if (!selectedFile) return
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }

  const handleUpload = async () => {
    const user = auth.currentUser
    if (!user) return toast.error('Please sign in first')
    if (!file) return toast.error('Choose a photo first')

    setUploading(true)
    try {
      const upload = await uploadToCloudinary(file, {
        folder: 'musify/profile-photos',
        tags: ['musify', 'profile-photo'],
        context: { type: 'profile_photo', uid: user.uid, email: user.email }
      })
      await updateProfile(user, { photoURL: upload.secureUrl })
      await setDoc(doc(db, 'userProfiles', user.uid), {
        photoURL: upload.secureUrl,
        photoPublicId: upload.publicId,
        updatedAt: serverTimestamp()
      }, { merge: true })
      toast.success('Profile photo updated')
    } catch (error) {
      console.error('Photo upload error:', error)
      toast.error(error.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '64px' }}>
      <ProfileSidebar />
      <main className="md:ml-[270px]" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '48px' }}>
        <h1 style={{
          fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '8px',
          background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Upload Profile Photo
        </h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>Choose a photo to personalize your profile</p>

        <section style={{
          width: '480px', padding: '40px', borderRadius: '16px',
          background: 'rgba(15, 15, 46, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid var(--color-border)'
        }}>
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%', border: '3px dashed var(--color-border)',
            margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}>
            {preview ? <img src={preview} alt="Selected profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
              <div style={{ color: 'var(--color-muted)', fontSize: '13px', textAlign: 'center' }}><Plus size={22} style={{ margin: '0 auto 4px' }} />No photo selected</div>
            )}
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '12px' }}>Choose Your Profile Photo</p>

          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              selectFile(event.dataTransfer.files[0])
            }}
            style={{
              display: 'block', border: '2px dashed var(--color-border)', borderRadius: '12px',
              padding: '32px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <input type="file" accept="image/*" hidden onChange={(event) => selectFile(event.target.files[0])} />
            <span style={{
              width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-secondary)',
              color: 'white', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}><Image size={20} /></span>
            <span style={{ display: 'block', color: 'var(--color-text)', fontSize: '14px' }}>Click to upload or drag and drop</span>
            <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>PNG, JPG, GIF up to 10MB</span>
          </label>

          <button onClick={handleUpload} disabled={uploading} style={{
            width: '100%', height: '48px', background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))',
            color: 'white', borderRadius: '8px', fontWeight: '600', marginTop: '20px', border: 'none', cursor: 'pointer'
          }}>{uploading ? 'Uploading...' : 'Upload Photo'}</button>
          <Link to="/profile" style={{ display: 'block', textAlign: 'center', color: 'var(--color-muted)', fontSize: '14px', marginTop: '12px' }}>
            &larr; Back to Profile
          </Link>

          <div style={{ background: 'rgba(59, 108, 244, 0.08)', border: '1px solid rgba(59, 108, 244, 0.2)', borderRadius: '10px', padding: '16px', marginTop: '20px', fontSize: '13px', color: 'var(--color-muted)' }}>
            <strong style={{ color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><Info size={16} />Photo Guidelines</strong>
            For best results, use a square image with your face clearly visible. The photo will be automatically cropped to a circle.
          </div>
        </section>
      </main>
    </div>
  )
}

export default UploadPhoto
