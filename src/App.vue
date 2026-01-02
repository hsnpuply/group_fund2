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
    <v-btn class="w-[20%] mx-auto py-8" @click="doToast()" color="primary">Hello V-btn</v-btn>
  </v-app>
</template>

<style scoped>
</style>
