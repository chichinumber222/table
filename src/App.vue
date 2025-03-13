<template>
  <div
    class="min-h-screen"
    :class="darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'"
  >
    <div class="flex flex-col items-center p-4">
      <label for="albumFilter" class="mb-2">
        Введите ID альбомов (через пробел)
      </label>
      <div class="flex space-x-2">
        <input
          id="albumFilter"
          type="text"
          v-model="localFilter"
          placeholder="Например: 1 2 3"
          class="border rounded p-2
                bg-white text-gray-900 
                dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          class="px-4 py-2 border rounded"
          @click="handleSearch"
          :disabled="loading"
        >
          <span v-if="loading">Загрузка...</span>
          <span v-else>Поиск</span>
        </button>
      </div>
      <div class="mt-4">
        <button
          class="px-4 py-2 border rounded"
          @click="toggleTheme"
        >
          {{ darkMode ? 'Светлая тема' : 'Тёмная тема' }}
        </button>
      </div>
    </div>
    <div class="flex justify-center">
      <PhotosTable />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { usePhotosStore } from './stores/photosStore'
  import PhotosTable from './components/PhotosTable.vue'

  const photosStore = usePhotosStore()

  const localFilter = ref('')

  const darkMode = ref(localStorage.getItem('darkMode') === 'true')

  function toggleTheme() {
    darkMode.value = !darkMode.value
    localStorage.setItem('darkMode', darkMode.value ? 'true' : 'false')
  }

  const loading = computed(() => photosStore.loading)

  async function handleSearch() {
    photosStore.setAlbumFilter(localFilter.value)
    await photosStore.fetchPhotos()
    localStorage.setItem('albumFilter', localFilter.value)
  }

  onMounted(async () => {
    const saved = localStorage.getItem('albumFilter') || ''
    localFilter.value = saved

    photosStore.setAlbumFilter(saved)

    await photosStore.fetchPhotos()
  })
</script>
