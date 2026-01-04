<script setup lang="ts">
import { ref } from 'vue'
import { useMemberFinancial, type DocumentItem, type LotteryItem } from '../../views/members/composables/useMemberFinancial'

const props = defineProps<{ memberId: number }>()

const { documents, loadingDocuments, lotteries } = useMemberFinancial(props.memberId)

const dialogOpen = ref<boolean>(false)
const selected = ref<{ id: number; title: string; url: string; status: string; lotteryName?: string } | null>(null)
const auditTrail = ref<Array<{ id: number; actor: string; time: string }>>([])

const openDoc = (doc: DocumentItem) => {
  const match = lotteries.value.find((l: LotteryItem) => l.id === doc.lotteryId)
  selected.value = { id: doc.id, title: doc.title, url: doc.url, status: doc.status, lotteryName: match?.name }
  auditTrail.value = [
    { id: 1, actor: 'ادمین', time: 'لحظاتی پیش' },
    { id: 2, actor: 'سیستم', time: 'دیروز' },
  ]
  dialogOpen.value = true
}
</script>

<template>
  <div class="documents-viewer" dir="rtl">
    <v-alert v-if="loadingDocuments" type="info" variant="tonal" class="mb-2">در حال بارگذاری...</v-alert>
    <v-alert v-else-if="documents.length === 0" type="warning" variant="tonal" class="mb-2">مدرکی ثبت نشده است.</v-alert>

    <div v-else class="docs-grid">
      <v-card v-for="d in documents" :key="d.id" class="doc-card" elevation="2">
        <div class="doc-header">
          <div class="title">{{ d.title }}</div>
          <v-chip :color="d.status==='approved' ? 'success' : d.status==='pending' ? 'warning' : 'error'" variant="tonal">
            {{ d.status==='approved' ? 'تایید شده' : d.status==='pending' ? 'در انتظار' : 'رد شده' }}
          </v-chip>
        </div>
        <div class="meta">مرتبط با: {{ lotteries.find((l: LotteryItem) => l.id === d.lotteryId)?.name || '—' }}</div>
        <div class="preview">
          <img :src="d.url" alt="preview" />
        </div>
        <div class="actions">
          <v-btn color="primary" variant="flat" @click="openDoc(d)"><v-icon class="me-1">mdi-eye</v-icon> مشاهده</v-btn>
        </div>
      </v-card>
    </div>

    <v-dialog v-model="dialogOpen" max-width="900">
      <v-card v-if="selected">
        <v-card-title>
          <v-icon class="me-1">mdi-file-document</v-icon>
          {{ selected.title }}
        </v-card-title>
        <v-card-text>
          <div class="viewer-grid">
            <div class="image">
              <img :src="selected.url" alt="document" />
            </div>
            <div class="info">
              <div class="row"><span>وضعیت:</span><strong>{{ selected.status==='approved' ? 'تایید شده' : selected.status==='pending' ? 'در انتظار' : 'رد شده' }}</strong></div>
              <div class="row"><span>قرعه‌کشی:</span><strong>{{ selected.lotteryName || '—' }}</strong></div>
              <div class="row"><span>دسترسی:</span><strong>فقط خواندنی</strong></div>
              <div class="row"><span>ردیابی دسترسی:</span></div>
              <v-table class="elevation-0 compact">
                <thead><tr><th>عامل</th><th>زمان</th></tr></thead>
                <tbody>
                  <tr v-for="a in auditTrail" :key="a.id"><td>{{ a.actor }}</td><td>{{ a.time }}</td></tr>
                </tbody>
              </v-table>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen=false">بستن</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.documents-viewer { direction: rtl; }
.docs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.doc-card { border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; background: var(--bg-primary); }
.doc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.meta { color: var(--text-secondary); font-size: .85rem; margin-bottom: 8px; }
.preview { border: 1px dashed var(--border-color); border-radius: 10px; overflow: hidden; background: var(--bg-secondary); height: 160px; display: flex; align-items: center; justify-content: center; }
.preview img { max-height: 100%; max-width: 100%; object-fit: contain; }
.actions { margin-top: 8px; display: flex; justify-content: flex-end; }
.viewer-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; }
.image { border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); padding: 8px; display: flex; align-items: center; justify-content: center; }
.image img { max-width: 100%; max-height: 500px; object-fit: contain; }
.info .row { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding: 6px 0; }
.compact th, .compact td { padding: 6px !important; }
@media (max-width: 900px){ .docs-grid { grid-template-columns: 1fr; } .viewer-grid { grid-template-columns: 1fr; } }
</style>
