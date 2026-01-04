<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  item: Partial<T>
  isEdit?: boolean
  title?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  title: '',
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:item': [item: Partial<T>]
  'save': []
}>()

const localValue = ref(props.modelValue)
const formRef = ref()

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

watch(localValue, (val) => {
  emit('update:modelValue', val)
})

const computedTitle = () => {
  if (props.title) return props.title
  return props.isEdit ? 'ویرایش' : 'افزودن'
}

const handleSave = () => {
  emit('save')
}

defineExpose({
  formRef
})
</script>

<template>
  <v-dialog v-model="localValue" max-width="640" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <div class="d-flex align-center">
          <v-icon class="me-2">{{ isEdit ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          <span>{{ computedTitle() }}</span>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="localValue = false"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef">
          <slot name="form" :item="item" :is-edit="isEdit" />
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4 justify-end">
        <v-btn
          variant="text"
          @click="localValue = false"
          :disabled="loading"
        >
          انصراف
        </v-btn>
        <v-btn
          color="#4caf50"
          variant="flat"
          class="elevate"
          @click="handleSave"
          :loading="loading"
        >
          ذخیره
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.elevate {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);
  transition: all 0.2s;
}

.elevate:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
}
</style>
