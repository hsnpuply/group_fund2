<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue'

interface Header {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
}

interface Props {
  headers: Header[]
  items: T[]
  search?: string
  itemsPerPage?: number
  loading?: boolean
  showSelect?: boolean
  selectedItems?: T[]
  title?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
  itemsPerPage: 10,
  loading: false,
  showSelect: false,
  selectedItems: () => [],
  title: 'جدول داده‌ها',
  icon: 'mdi-table'
})

const emit = defineEmits<{
  'update:selectedItems': [items: T[]]
  'update:search': [value: string]
  'update:itemsPerPage': [value: number]
  'create': []
  'view': [item: T]
  'edit': [item: T]
  'delete': [item: T]
  'deleteSelected': []
  'export': []
}>()

const localSearch = computed({
  get: () => props.search,
  set: (val) => emit('update:search', val)
})

const localItemsPerPage = computed({
  get: () => props.itemsPerPage,
  set: (val) => emit('update:itemsPerPage', val)
})

const localSelectedItems = computed({
  get: () => props.selectedItems,
  set: (val) => emit('update:selectedItems', val)
})
</script>

<template>
  <v-card elevation="8" class="premium-datatable-card">
    <!-- Header Section -->
    <div class="datatable-header">
      <div class="datatable-title">
        <v-icon class="me-2" size="28">{{ icon }}</v-icon>
        <span>{{ title }}</span>
      </div>
      <div class="datatable-actions">
        <slot name="header-actions">
          <v-btn
            variant="flat"
            class="elevate me-2"
            size="small"
            :style="{ background: 'var(--accent)', color: '#fff' }"
            @click="emit('create')"
          >
            <v-icon class="me-1" size="18">mdi-plus</v-icon>
            افزودن
          </v-btn>
          <v-btn
            v-if="localSelectedItems.length > 0"
            color="error"
            variant="flat"
            class="me-2"
            size="small"
            @click="emit('deleteSelected')"
          >
            <v-icon class="me-1" size="18">mdi-delete</v-icon>
            حذف {{ localSelectedItems.length }} مورد
          </v-btn>
          <v-btn
            variant="flat"
            class="elevate"
            size="small"
            :style="{ background: 'var(--accent-weak)', color: 'var(--accent-strong)' }"
            @click="emit('export')"
          >
            <v-icon class="me-1" size="18">mdi-export</v-icon>
            خروجی
          </v-btn>
        </slot>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="datatable-filters">
      <slot name="filters" :search="localSearch" :itemsPerPage="localItemsPerPage">
        <v-text-field
          v-model="localSearch"
          density="compact"
          placeholder="جستجو..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          clearable
          class="search-field"
        />
        
        <v-select
          v-model="localItemsPerPage"
          :items="[5, 10, 25, 50, 100]"
          density="compact"
          variant="outlined"
          hide-details
          class="per-page-select"
        />
      </slot>
    </div>

    <!-- Data Table -->
    <v-data-table
      v-model="localSelectedItems"
      :headers="headers"
      :items="items"
      :search="localSearch"
      :items-per-page="localItemsPerPage"
      :loading="loading"
      :show-select="showSelect"
      class="elevation-0 premium-table"
      hover
    >
      <!-- Pass through all item slots -->
      <template v-for="(_, name) in $slots" :key="name" v-slot:[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>

      <!-- Default actions slot if not provided -->
      <template v-if="!$slots['item.actions']" v-slot:item.actions="{ item }">
        <div class="action-buttons">
          <v-btn
            icon
            size="small"
            variant="text"
            color="info"
            @click="emit('view', item)"
          >
            <v-icon size="18">mdi-eye</v-icon>
            <v-tooltip activator="parent" location="top">نمایش جزئیات</v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            color="warning"
            @click="emit('edit', item)"
          >
            <v-icon size="18">mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="top">ویرایش</v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            @click="emit('delete', item)"
          >
            <v-icon size="18">mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top">حذف</v-tooltip>
          </v-btn>
        </div>
      </template>

      <!-- Footer Slot -->
      <template v-slot:bottom>
        <slot name="footer" :items="items">
          <div class="table-footer">
            <div class="footer-info">
              مجموع: {{ items.length }} مورد
            </div>
          </div>
        </slot>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
.premium-datatable-card {
  border-radius: 18px;
  padding: 20px;
  direction: rtl;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.datatable-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.datatable-title {
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
}

.datatable-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.elevate {
  box-shadow: 0 4px 12px rgba(63, 178, 122, 0.22);
  transition: all 0.2s;
}

.elevate:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(63, 178, 122, 0.3);
}

.datatable-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 250px;
}

.per-page-select {
  width: 100px;
}

.premium-table {
  border-radius: 12px;
  overflow: hidden;
}

.premium-table :deep(th) {
  background: var(--bg-secondary) !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  border-bottom: 2px solid var(--accent) !important;
}

.premium-table :deep(tbody tr:hover) {
  background: var(--accent-weak) !important;
}

.premium-table :deep(tbody tr) {
  transition: all 0.2s;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.table-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  font-weight: 600;
  color: var(--text-secondary);
}

@media (max-width: 600px) {
  .datatable-filters {
    flex-direction: column;
  }
  
  .search-field,
  .per-page-select {
    width: 100%;
  }
  
  .datatable-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .datatable-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .datatable-actions > * {
    flex: 1;
  }
}
</style>
