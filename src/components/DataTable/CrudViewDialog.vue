<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  item: T | null
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'جزئیات'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const localValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

watch(localValue, (val) => {
  emit('update:modelValue', val)
})
</script>

<template>
  <v-dialog v-model="localValue" max-width="600">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-eye</v-icon>
          <span>{{ title }}</span>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="localValue = false"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6" v-if="item">
        <slot name="content" :item="item">
          <v-list density="compact">
            <v-list-item
              v-for="(value, key) in item"
              :key="key"
              :title="String(key)"
              :subtitle="String(value)"
            />
          </v-list>
        </slot>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4 justify-end">
        <v-btn variant="text" @click="localValue = false">
          بستن
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
