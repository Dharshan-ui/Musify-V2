const ADMIN_STORAGE_KEY = 'musify_admin'
const ADMIN_SESSION_KEY = 'musify_admin_session'
const MEDIA_DB_NAME = 'musify_media_db'
const MEDIA_STORE_NAME = 'media'
const MEDIA_URL_PREFIX = 'musify-media:'
const mediaObjectUrlCache = new Map()

const defaultAdmin = {
  id: 'admin-1',
  username: 'admin',
  email: 'admin@musify.local',
  passwordHash: hashPassword('admin123'),
  role: 'admin',
  permissions: ['create_album', 'delete_album', 'manage_users', 'publish_content'],
  albums: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLogin: '',
  isActive: true
}

export function hashPassword(value) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index)
    hash |= 0
  }

  return `local-${Math.abs(hash).toString(16)}`
}

export function createId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function openMediaDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MEDIA_DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveFileToMediaUrl(file, prefix = 'media') {
  const db = await openMediaDb()
  const id = createId(prefix)

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(MEDIA_STORE_NAME)

    store.put({
      id,
      blob: file,
      name: file.name,
      type: file.type,
      size: file.size,
      createdAt: new Date().toISOString()
    })

    transaction.oncomplete = () => resolve(`${MEDIA_URL_PREFIX}${id}`)
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function resolveMediaUrl(value) {
  if (!value || !value.startsWith(MEDIA_URL_PREFIX)) {
    return value || ''
  }

  if (mediaObjectUrlCache.has(value)) {
    return mediaObjectUrlCache.get(value)
  }

  const db = await openMediaDb()
  const id = value.replace(MEDIA_URL_PREFIX, '')

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE_NAME, 'readonly')
    const store = transaction.objectStore(MEDIA_STORE_NAME)
    const request = store.get(id)

    request.onsuccess = () => {
      const item = request.result

      if (!item?.blob) {
        resolve('')
        return
      }

      const objectUrl = URL.createObjectURL(item.blob)
      mediaObjectUrlCache.set(value, objectUrl)
      resolve(objectUrl)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function deleteMediaUrl(value) {
  if (!value || !value.startsWith(MEDIA_URL_PREFIX)) return

  const cachedUrl = mediaObjectUrlCache.get(value)

  if (cachedUrl) {
    URL.revokeObjectURL(cachedUrl)
    mediaObjectUrlCache.delete(value)
  }

  const db = await openMediaDb()
  const id = value.replace(MEDIA_URL_PREFIX, '')

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(MEDIA_STORE_NAME)

    store.delete(id)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export function getStoredAdmin() {
  const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY)

  if (!storedAdmin) {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaultAdmin))
    return defaultAdmin
  }

  try {
    const admin = JSON.parse(storedAdmin)

    return {
      ...defaultAdmin,
      ...admin,
      albums: Array.isArray(admin.albums) ? admin.albums : []
    }
  } catch (error) {
    console.error('Admin data parse error:', error)
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaultAdmin))
    return defaultAdmin
  }
}

export function saveStoredAdmin(admin) {
  const updatedAdmin = {
    ...admin,
    updatedAt: new Date().toISOString()
  }

  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updatedAdmin))
  return updatedAdmin
}

export function loginAdmin(identifier, password) {
  const admin = getStoredAdmin()
  const matchesIdentity = admin.email === identifier || admin.username === identifier
  const matchesPassword = admin.passwordHash === hashPassword(password)

  if (!matchesIdentity || !matchesPassword || admin.role !== 'admin' || !admin.isActive) {
    throw new Error('Invalid admin credentials')
  }

  const nextAdmin = saveStoredAdmin({
    ...admin,
    lastLogin: new Date().toISOString()
  })

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
    id: nextAdmin.id,
    username: nextAdmin.username,
    email: nextAdmin.email,
    role: nextAdmin.role,
    permissions: nextAdmin.permissions,
    loggedInAt: new Date().toISOString()
  }))

  return nextAdmin
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}

export function getAdminSession() {
  const session = localStorage.getItem(ADMIN_SESSION_KEY)

  if (!session) return null

  try {
    return JSON.parse(session)
  } catch (error) {
    console.error('Admin session parse error:', error)
    logoutAdmin()
    return null
  }
}

export function isAdminAuthenticated() {
  const session = getAdminSession()
  return session?.role === 'admin'
}

export function hasAdminPermission(permission) {
  const session = getAdminSession()
  return session?.role === 'admin' && session.permissions?.includes(permission)
}

export async function toPublicAlbum(album) {
  const coverUrl = await resolveMediaUrl(album.coverImageUrl)
  const songs = await Promise.all((album.tracks || []).map(async (track) => {
    const audioUrl = await resolveMediaUrl(track.audioFileUrl)
    const songCardImageUrl = await resolveMediaUrl(track.songCardImageUrl)

    return {
      id: track.id,
      title: track.title,
      artist: album.artist,
      duration: track.duration,
      genre: track.genre,
      audioUrl,
      audioFileUrl: audioUrl,
      songCardImageUrl,
      albumArt: songCardImageUrl || coverUrl,
      size: 'Local file'
    }
  }))

  return {
    ...album,
    coverUrl,
    songs
  }
}

export async function getPublicAdminAlbums() {
  return Promise.all(getStoredAdmin().albums.map(toPublicAlbum))
}
