import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface Photo {
  albumId: number
  id: number
  title: string
  url: string
  thumbnailUrl: string
}

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref<Photo[]>([])

  const albumFilter = ref('')
  
  const loading = ref(false)

  const error = ref<string | null>(null)

  const isDone = ref(false)

  const startIndex = ref(0)

  function setAlbumFilter(filter: string) {
    albumFilter.value = filter
    resetPhotosState()
  }

  function resetPhotosState() {
    photos.value = []
    startIndex.value = 0
    isDone.value = false
    error.value = null
  }

  async function fetchPhotos() {
    if (loading.value || isDone.value) return

    loading.value = true
    error.value = null

    try {
      const limit = (startIndex.value === 0) ? 30 : 20
      let url = 'https://jsonplaceholder.typicode.com/photos'
      
      const filterTrim = albumFilter.value.trim()
      if (filterTrim) {
        const ids = filterTrim.split(' ').filter(i => i)
        const queryAlbums = ids.map(id => 'albumId=' + id).join('&')
        url += `?${queryAlbums}&_start=${startIndex.value}&_limit=${limit}`
      } else {
        url += `?_start=${startIndex.value}&_limit=${limit}`
      }

      const { data } = await axios.get<Photo[]>(url)

      photos.value.push(...data)

      if (data.length < limit) {
        isDone.value = true
      }

      startIndex.value += limit
    } catch (err: any) {
      error.value = err?.message || 'Error fetching photos'
    } finally {
      loading.value = false
    }
  }

  return {
    photos,
    albumFilter,
    loading,
    error,
    isDone,
    setAlbumFilter,
    resetPhotosState,
    fetchPhotos,
  }
})
