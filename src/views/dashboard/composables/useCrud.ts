import { ref, type Ref } from 'vue'

export interface CrudItem {
  id: number | string
  [key: string]: any
}

export interface CrudOptions<T extends CrudItem> {
  initialData?: T[]
  onBeforeCreate?: (item: Partial<T>) => Promise<Partial<T>> | Partial<T>
  onAfterCreate?: (item: T) => Promise<void> | void
  onBeforeUpdate?: (item: Partial<T>) => Promise<Partial<T>> | Partial<T>
  onAfterUpdate?: (item: T) => Promise<void> | void
  onBeforeDelete?: (item: T) => Promise<boolean> | boolean
  onAfterDelete?: (item: T) => Promise<void> | void
}

export function useCrud<T extends CrudItem>(options: CrudOptions<T> = {}) {
  const {
    initialData = [],
    onBeforeCreate,
    onAfterCreate,
    onBeforeUpdate,
    onAfterUpdate,
    onBeforeDelete,
    onAfterDelete,
  } = options

  // State
  const items: Ref<T[]> = ref([...initialData]) as Ref<T[]>
  const dialogForm = ref(false)
  const dialogView = ref(false)
  const dialogDelete = ref(false)
  const dialogBulkDelete = ref(false)
  const isEdit = ref(false)
  const viewItem: Ref<T | null> = ref(null)
  const deleteItem: Ref<T | null> = ref(null)
  const formItem: Ref<Partial<T>> = ref({})
  const selectedItems: Ref<T[]> = ref([])
  const formRef = ref()
  const loading = ref(false)

  // CRUD Operations
  const create = async (item: Partial<T>): Promise<T | null> => {
    try {
      loading.value = true
      
      // Call before hook
      let processedItem = item
      if (onBeforeCreate) {
        processedItem = await onBeforeCreate(item)
      }

      // Generate new ID
      const maxId = items.value.reduce((max, item) => {
        const id = typeof item.id === 'number' ? item.id : parseInt(item.id as string)
        return Math.max(max, id || 0)
      }, 0)
      
      const newItem = {
        ...processedItem,
        id: maxId + 1,
      } as T

      // Add to items
      items.value.unshift(newItem)

      // Call after hook
      if (onAfterCreate) {
        await onAfterCreate(newItem)
      }

      return newItem
    } catch (error) {
      console.error('Error creating item:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const update = async (id: number | string, updates: Partial<T>): Promise<T | null> => {
    try {
      loading.value = true
      
      // Call before hook
      let processedUpdates = updates
      if (onBeforeUpdate) {
        processedUpdates = await onBeforeUpdate(updates)
      }

      const index = items.value.findIndex(item => item.id === id)
      if (index === -1) {
        throw new Error('Item not found')
      }

      // Update item
      const updatedItem = {
        ...items.value[index],
        ...processedUpdates,
        id, // Ensure ID doesn't change
      } as T

      items.value[index] = updatedItem

      // Call after hook
      if (onAfterUpdate) {
        await onAfterUpdate(updatedItem)
      }

      return updatedItem
    } catch (error) {
      console.error('Error updating item:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: number | string): Promise<boolean> => {
    try {
      loading.value = true
      
      const index = items.value.findIndex(item => item.id === id)
      if (index === -1) {
        throw new Error('Item not found')
      }

      const item = items.value[index]

      // Call before hook
      if (onBeforeDelete) {
        const canDelete = await onBeforeDelete(item)
        if (!canDelete) {
          return false
        }
      }

      // Remove item
      items.value.splice(index, 1)

      // Call after hook
      if (onAfterDelete) {
        await onAfterDelete(item)
      }

      return true
    } catch (error) {
      console.error('Error deleting item:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const bulkRemove = async (ids: (number | string)[]): Promise<boolean> => {
    try {
      loading.value = true
      
      const itemsToDelete = items.value.filter(item => ids.includes(item.id))

      // Call before hook for each item
      if (onBeforeDelete) {
        for (const item of itemsToDelete) {
          const canDelete = await onBeforeDelete(item)
          if (!canDelete) {
            return false
          }
        }
      }

      // Remove items
      items.value = items.value.filter(item => !ids.includes(item.id))

      // Call after hook for each item
      if (onAfterDelete) {
        for (const item of itemsToDelete) {
          await onAfterDelete(item)
        }
      }

      return true
    } catch (error) {
      console.error('Error bulk deleting items:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const findById = (id: number | string): T | undefined => {
    return items.value.find(item => item.id === id)
  }

  // Dialog Actions
  const openCreate = (defaultValues: Partial<T> = {}) => {
    isEdit.value = false
    formItem.value = { ...defaultValues }
    dialogForm.value = true
  }

  const openView = (item: T) => {
    viewItem.value = { ...item }
    dialogView.value = true
  }

  const openEdit = (item: T) => {
    isEdit.value = true
    formItem.value = { ...item }
    dialogForm.value = true
  }

  const openDelete = (item: T) => {
    deleteItem.value = item
    dialogDelete.value = true
  }

  const openBulkDelete = () => {
    if (selectedItems.value.length === 0) return
    dialogBulkDelete.value = true
  }

  const saveItem = async (): Promise<boolean> => {
    // Validate form if formRef exists
    if (formRef.value) {
      const result = await formRef.value?.validate?.()
      if (result && result.valid === false) {
        return false
      }
    }

    let success = false
    
    if (isEdit.value && formItem.value.id != null) {
      const updated = await update(formItem.value.id, formItem.value)
      success = updated !== null
    } else {
      const created = await create(formItem.value)
      success = created !== null
    }

    if (success) {
      dialogForm.value = false
      formItem.value = {}
    }

    return success
  }

  const confirmDelete = async (): Promise<boolean> => {
    if (!deleteItem.value) return false
    
    const success = await remove(deleteItem.value.id)
    
    if (success) {
      deleteItem.value = null
      dialogDelete.value = false
    }

    return success
  }

  const confirmBulkDelete = async (): Promise<boolean> => {
    if (selectedItems.value.length === 0) return false
    
    const ids = selectedItems.value.map(item => item.id)
    const success = await bulkRemove(ids)
    
    if (success) {
      selectedItems.value = []
      dialogBulkDelete.value = false
    }

    return success
  }

  const closeDialogs = () => {
    dialogForm.value = false
    dialogView.value = false
    dialogDelete.value = false
    dialogBulkDelete.value = false
    formItem.value = {}
    viewItem.value = null
    deleteItem.value = null
  }

  return {
    // State
    items,
    selectedItems,
    loading,
    
    // Dialog states
    dialogForm,
    dialogView,
    dialogDelete,
    dialogBulkDelete,
    isEdit,
    viewItem,
    deleteItem,
    formItem,
    formRef,
    
    // CRUD operations
    create,
    update,
    remove,
    bulkRemove,
    findById,
    
    // Dialog actions
    openCreate,
    openView,
    openEdit,
    openDelete,
    openBulkDelete,
    saveItem,
    confirmDelete,
    confirmBulkDelete,
    closeDialogs,
  }
}
