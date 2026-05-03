import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore'
import { db, isFirebaseReady } from '../backend/firebase'

const timestampToMillis = (value) => {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  const millis = new Date(value).getTime()
  return Number.isFinite(millis) ? millis : 0
}

export const isMusicStoreReady = () => isFirebaseReady() && !!db

export const normalizeSong = (song) => {
  const audioFileUrl = song.audioFileUrl || song.audioUrl || ''
  const songCardImageUrl = song.songCardImageUrl || song.albumArt || ''

  return {
    ...song,
    audioFileUrl,
    audioUrl: audioFileUrl,
    songCardImageUrl,
    albumArt: song.albumArt || songCardImageUrl || song.coverUrl || '',
    createdAtMillis: timestampToMillis(song.createdAt)
  }
}

export const normalizeAlbum = (album) => {
  const tracks = (album.tracks || album.songs || []).map(normalizeSong)
  const coverUrl = album.coverUrl || album.coverImageUrl || ''

  return {
    ...album,
    coverUrl,
    coverImageUrl: album.coverImageUrl || coverUrl,
    tracks,
    songs: tracks,
    songCount: album.songCount ?? tracks.length,
    createdAtMillis: timestampToMillis(album.createdAt)
  }
}

const assertReady = () => {
  if (!isMusicStoreReady()) {
    throw new Error('Firebase is not configured')
  }
}

export async function listAlbums(limitCount) {
  assertReady()

  const constraints = [orderBy('createdAt', 'desc')]

  if (limitCount) {
    constraints.push(limit(limitCount))
  }

  const snapshot = await getDocs(query(collection(db, 'albums'), ...constraints))

  return snapshot.docs.map((item) => normalizeAlbum({
    id: item.id,
    ...item.data()
  }))
}

export async function listSongsByAlbum(albumId) {
  assertReady()

  const snapshot = await getDocs(query(
    collection(db, 'songs'),
    where('albumId', '==', albumId)
  ))

  return snapshot.docs
    .map((item) => normalizeSong({ id: item.id, ...item.data() }))
    .sort((first, second) => first.createdAtMillis - second.createdAtMillis)
}

export async function listAlbumsWithSongs(limitCount) {
  const albums = await listAlbums(limitCount)
  const albumsWithSongs = await Promise.all(albums.map(async (album) => {
    const tracks = await listSongsByAlbum(album.id)
    return normalizeAlbum({
      ...album,
      tracks,
      songs: tracks,
      songCount: album.songCount ?? tracks.length
    })
  }))

  return albumsWithSongs
}

export async function getAlbumWithSongs(albumId) {
  assertReady()

  const albumSnapshot = await getDoc(doc(db, 'albums', albumId))

  if (!albumSnapshot.exists()) return null

  const tracks = await listSongsByAlbum(albumId)

  return normalizeAlbum({
    id: albumSnapshot.id,
    ...albumSnapshot.data(),
    tracks,
    songs: tracks
  })
}

export async function createAlbumMetadata(album) {
  assertReady()

  await setDoc(doc(db, 'albums', album.id), {
    title: album.title,
    artist: album.artist,
    year: album.year,
    coverUrl: album.coverUrl || album.coverImageUrl,
    coverImageUrl: album.coverImageUrl || album.coverUrl,
    coverPublicId: album.coverPublicId || '',
    songCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function updateAlbumMetadata(albumId, updates) {
  assertReady()

  await updateDoc(doc(db, 'albums', albumId), {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteAlbumMetadata(albumId) {
  assertReady()

  const songsSnapshot = await getDocs(query(
    collection(db, 'songs'),
    where('albumId', '==', albumId)
  ))
  const batch = writeBatch(db)

  songsSnapshot.docs.forEach((song) => {
    batch.delete(song.ref)
  })
  batch.delete(doc(db, 'albums', albumId))

  await batch.commit()
}

export async function createSongMetadata(album, song) {
  assertReady()

  await setDoc(doc(db, 'songs', song.id), {
    title: song.title,
    artist: album.artist,
    albumId: album.id,
    albumTitle: album.title,
    duration: song.duration,
    genre: song.genre,
    audioUrl: song.audioFileUrl || song.audioUrl,
    audioFileUrl: song.audioFileUrl || song.audioUrl,
    audioPublicId: song.audioPublicId || '',
    songCardImageUrl: song.songCardImageUrl || song.albumArt || '',
    songCardPublicId: song.songCardPublicId || '',
    albumArt: song.albumArt || song.songCardImageUrl || album.coverUrl || album.coverImageUrl || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  await updateDoc(doc(db, 'albums', album.id), {
    songCount: increment(1),
    updatedAt: serverTimestamp()
  })
}

export async function updateSongMetadata(songId, updates) {
  assertReady()

  await updateDoc(doc(db, 'songs', songId), {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteSongMetadata(albumId, songId) {
  assertReady()

  await deleteDoc(doc(db, 'songs', songId))
  await updateDoc(doc(db, 'albums', albumId), {
    songCount: increment(-1),
    updatedAt: serverTimestamp()
  })
}
