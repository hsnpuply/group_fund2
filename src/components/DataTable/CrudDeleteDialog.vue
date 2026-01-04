<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, watch, computed } from 'vue'

interface Props {
  modelValue: boolean
  item: T | null
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'تأیید حذف',
  message: 'آیا از حذف این مورد اطمینان دارید؟ این عملیات قابل بازگشت نیست.',
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

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <v-dialog v-model="localValue" max-width="480">
    <v-card>
      <v-card-title class="d-flex align-center px-6 py-4">
        <v-icon class="me-2" color="error">mdi-alert-circle</v-icon>
        <span>{{ title }}</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <slot name="message" :item="item">
          {{ message }}
        </slot>
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
