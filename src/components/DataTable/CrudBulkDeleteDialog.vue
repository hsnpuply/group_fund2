<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  count: number
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'حذف گروهی',
  message: '',
  confirmText: 'حذف',
  cancelText: 'انصراف',
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const localValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

watch(localValue, (val) => {
  emit('update:modelValue', val)
})

const computedMessage = () => {
  if (props.message) return props.message
  return `شما ${props.count} مورد را برای حذف انتخاب کرده‌اید. ادامه می‌دهید؟`
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <v-dialog v-model="localValue" max-width="520">
    <v-card>
      <v-card-title class="d-flex align-center px-6 py-4">
        <v-icon class="me-2" color="error">mdi-delete-alert</v-icon>
        <span>{{ title }}</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <div class="text-body-1">
          {{ computedMessage() }}
        </div>
        <v-alert
          type="warning"
          variant="tonal"
          class="mt-4"
          density="compact"
        >
          این عملیات قابل بازگشت نیست و تمام موارد انتخاب شده حذف خواهند شد.
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4 justify-end">
        <v-btn
          variant="text"
          @click="localValue = false"
          :disabled="loading"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
