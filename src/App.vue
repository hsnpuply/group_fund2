<script setup lang="ts">
import { useToast } from 'vue-toastification'
const toast = useToast()


const doToast = () => {
  toast.error('Hello from Vue Toasted Composable!')
}
</script>

<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
</style>
