import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface DataTableOptions<T> {
  initialSearch?: string
  initialItemsPerPage?: number
  initialFilter?: Record<string, any>
  filterFn?: (item: T, filters: Record<string, any>) => boolean
  formatters?: Record<string, (value: any) => string>
}

export interface UseDataTableReturn<T> {
  search: Ref<string>
  itemsPerPage: Ref<number>
  filters: Ref<Record<string, any>>
  filteredItems: ComputedRef<T[]>
  setFilter: (key: string, value: any) => void
  clearFilters: () => void
  exportToCSV: (headers: Array<{ key: string; title: string }>, filename?: string) => void
  exportToJSON: (filename?: string) => void
  formatValue: (key: string, value: any) => string
}

export function useDataTable<T extends Record<string, any>>(
  items: Ref<T[]>,
  options: DataTableOptions<T> = {}
): UseDataTableReturn<T> {
  const {
    initialSearch = '',
    initialItemsPerPage = 10,
    initialFilter = {},
    filterFn,
    formatters = {},
  } = options

  // State
  const search = ref(initialSearch)
  const itemsPerPage = ref(initialItemsPerPage)
  const filters: Ref<Record<string, any>> = ref({ ...initialFilter })

  // Computed filtered items
  const filteredItems = computed(() => {
    let filtered = items.value

    // Apply custom filter function if provided
    if (filterFn && Object.keys(filters.value).length > 0) {
      filtered = filtered.filter(item => filterFn(item, filters.value))
    } else {
      // Default filtering by individual filter keys
      Object.keys(filters.value).forEach(key => {
        const filterValue = filters.value[key]
        if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
          filtered = filtered.filter(item => {
            const itemValue = item[key]
            if (typeof filterValue === 'string') {
              return String(itemValue).toLowerCase().includes(filterValue.toLowerCase())
            }
            return itemValue === filterValue
          })
        }
      })
    }

    return filtered
  })

  // Filter management
  const setFilter = (key: string, value: any) => {
    filters.value[key] = value
  }

  const clearFilters = () => {
    filters.value = { ...initialFilter }
  }

  // Format value with custom formatter
  const formatValue = (key: string, value: any): string => {
    if (formatters[key]) {
      return formatters[key](value)
    }
    return String(value)
  }

  // Export to CSV
  const exportToCSV = (
    headers: Array<{ key: string; title: string }>,
    filename: string = `export_${new Date().getTime()}.csv`
  ) => {
    try {
      const csvHeaders = headers.map(h => h.title).join(',')
      const csvRows = filteredItems.value.map(item => {
        return headers.map(h => {
          const value = item[h.key]
          const formatted = formatValue(h.key, value)
          // Escape commas and quotes
          return `"${String(formatted).replace(/"/g, '""')}"`
        }).join(',')
      })

      const csvContent = [csvHeaders, ...csvRows].join('\n')
      
      // Add BOM for UTF-8
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      
      // Cleanup
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Error exporting to CSV:', error)
    }
  }

  // Export to JSON
  const exportToJSON = (filename: string = `export_${new Date().getTime()}.json`) => {
    try {
      const jsonContent = JSON.stringify(filteredItems.value, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      
      // Cleanup
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Error exporting to JSON:', error)
    }
  }

  return {
    search,
    itemsPerPage,
    filters,
    filteredItems,
    setFilter,
    clearFilters,
    exportToCSV,
    exportToJSON,
    formatValue,
  }
}
