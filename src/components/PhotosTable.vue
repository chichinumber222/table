<template>
  <div
    ref="tableContainer"
    class="border border-gray-300 overflow-x-auto overflow-y-auto"
    style="width: 600px; height: 600px;"
    @scroll="onScroll"
  >
    <table class="table-auto whitespace-nowrap w-full">
      <thead class="sticky top-0 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="p-2 border-b border-gray-300 cursor-pointer"
            @click="sortBy(col.key)"
          >
            <span class="inline-flex items-center gap-1">
              {{ col.label }}
              <span v-if="sortColumn === col.key" class="text-xs">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="photo in sortedPhotos"
          :key="photo.id"
          class="border-b border-gray-200"
        >
          <td class="p-2 truncate" :title="String(photo.id)">
            {{ photo.id }}
          </td>
          <td class="p-2 truncate" :title="String(photo.albumId)">
            {{ photo.albumId }}
          </td>
          <td class="p-2 truncate" :title="photo.title">
            {{ photo.title }}
          </td>
          <td class="p-2 truncate" :title="photo.url">
            <a
              :href="photo.url"
              target="_blank"
              rel="noopener noreferrer"
              class="underline"
            >
              {{ photo.url }}
            </a>
          </td>
          <td class="p-2 truncate">
            <img
              :src="photo.thumbnailUrl"
              :alt="photo.title"
              class="max-h-16"
              :title="photo.thumbnailUrl"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, type Ref } from 'vue'
  import { usePhotosStore, type Photo } from '../stores/photosStore'

  interface TableColumn {
    key: keyof Photo
    label: string
  }

  const columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'albumId', label: 'Альбом' },
    { key: 'title', label: 'Название' },
    { key: 'url', label: 'Ссылка' },
    { key: 'thumbnailUrl', label: 'Миниатюра' }
  ]

  const photosStore = usePhotosStore()

  const sortColumn = ref<keyof Photo | null>(null)
  const sortOrder = ref<'asc' | 'desc'>('asc')

  const allPhotos = computed<Photo[]>(() => photosStore.photos)

  function sortBy(columnKey: keyof Photo) {
    if (sortColumn.value === columnKey) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = columnKey
      sortOrder.value = 'asc'
    }
  }

  const sortedPhotos = computed<Photo[]>(() => {
    const data = [...allPhotos.value]
    if (!sortColumn.value) return data

    const col = sortColumn.value
    return data.sort((a, b) => {
      const valA = a[col]
      const valB = b[col]
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  })

  watch(() => photosStore.photos, () => {
    sortColumn.value = null
    sortOrder.value = 'asc'
  })

  const tableContainer: Ref<HTMLDivElement | null> = ref(null)
  function onScroll() {
    if (!tableContainer.value) return
    const { scrollTop, scrollHeight, clientHeight } = tableContainer.value
    
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (!photosStore.isDone && !photosStore.loading) {
        photosStore.fetchPhotos() 
      }
    }
  }
</script>

