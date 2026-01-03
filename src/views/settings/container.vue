<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const contributionAmount = ref(2000000)
const drawFrequency = ref('weekly')
const cycleLength = ref(12)
const payoutOrder = ref('round-robin')
const smsNotifications = ref(true)
const pushNotifications = ref(true)
const theme = ref('system')

const save = () => {
  toast.success('تنظیمات ذخیره شد')
}
</script>

<template>
  <div class="settings-page">
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <v-container class="py-8" fluid>
      <div class="header">
        <div class="title-wrap">
          <v-icon size="42" color="#4caf50">mdi-cog</v-icon>
          <div class="titles">
            <h1 class="title">تنظیمات صندوق</h1>
            <p class="subtitle">پیکربندی صندوق قرعه‌کشی و ترجیحات</p>
          </div>
        </div>
      </div>

      <v-row class="mt-2" dense>
        <v-col cols="12" md="8">
          <v-card class="panel-card" elevation="8">
            <div class="panel-header">
              <div class="panel-title">
                <v-icon class="me-2">mdi-cash</v-icon>
                تنظیمات مالی
              </div>
            </div>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="contributionAmount" dir="ltr" label="مبلغ واریزی هر عضو (﷼)" type="number" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="drawFrequency" :items="[
                  { title: 'هفتگی', value: 'weekly' },
                  { title: 'دو هفته یکبار', value: 'biweekly' },
                  { title: 'ماهانه', value: 'monthly' },
                ]" label="تناوب قرعه‌کشی" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="cycleLength" label="طول چرخه (تعداد دور)" type="number" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="payoutOrder" :items="[
                  { title: 'نوبتی (Round-robin)', value: 'round-robin' },
                  { title: 'تصادفی', value: 'random' },
                ]" label="ترتیب پرداخت جایزه" variant="outlined" hide-details />
              </v-col>
            </v-row>
          </v-card>

          <v-card class="panel-card mt-4" elevation="8">
            <div class="panel-header">
              <div class="panel-title">
                <v-icon class="me-2">mdi-bell</v-icon>
                اعلان‌ها و ترجیحات
              </div>
            </div>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-switch v-model="smsNotifications" label="ارسال پیامک رویدادها" color="#4caf50" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="pushNotifications" label="اعلان‌های درون برنامه" color="#4caf50" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="theme" :items="[
                  { title: 'سیستم', value: 'system' },
                  { title: 'روشن', value: 'light' },
                  { title: 'تیره', value: 'dark' },
                ]" label="پوسته" variant="outlined" hide-details />
              </v-col>
            </v-row>

            <div class="panel-actions">
              <v-btn color="#4caf50" class="elevate" variant="flat" @click="save">
                <v-icon class="me-2">mdi-content-save</v-icon>
                ذخیره تنظیمات
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="summary-card" elevation="8">
            <div class="summary-title">
              <v-icon class="me-2">mdi-file-document</v-icon>
              خلاصه تنظیمات
            </div>
            <div class="summary-item">
              <span>مبلغ واریزی:</span>
              <strong dir="ltr">﷼ {{ new Intl.NumberFormat('fa-IR').format(contributionAmount) }}</strong>
            </div>
            <div class="summary-item">
              <span>تناوب قرعه‌کشی:</span>
              <strong>{{ drawFrequency === 'weekly' ? 'هفتگی' : drawFrequency === 'biweekly' ? 'دو هفته یکبار' : 'ماهانه' }}</strong>
            </div>
            <div class="summary-item">
              <span>طول چرخه:</span>
              <strong>{{ cycleLength }} دور</strong>
            </div>
            <div class="summary-item">
              <span>ترتیب پرداخت:</span>
              <strong>{{ payoutOrder === 'round-robin' ? 'نوبتی' : 'تصادفی' }}</strong>
            </div>
            <div class="summary-item">
              <span>اعلان‌ها:</span>
              <strong>{{ (smsNotifications ? 'SMS ' : '') + (pushNotifications ? 'Push' : '') || 'غیرفعال' }}</strong>
            </div>
            <div class="summary-item">
              <span>پوسته:</span>
              <strong>{{ theme === 'system' ? 'سیستم' : theme === 'light' ? 'روشن' : 'تیره' }}</strong>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.settings-page { min-height: 100vh; background: linear-gradient(135deg, #f8faf8 0%, #e8f5e9 100%); position: relative; }
.bg-decoration { position: absolute; inset: 0; pointer-events: none; }
.circle { position: absolute; border-radius: 50%; opacity: 0.08; }
.circle-1 { width: 460px; height: 460px; background: #4caf50; top: -100px; right: -100px; }
.circle-2 { width: 320px; height: 320px; background: #81c784; bottom: -60px; left: -60px; }

.header { display: flex; align-items: center; justify-content: space-between; gap: 16px; direction: rtl; }
.title-wrap { display: flex; align-items: center; gap: 14px; }
.titles .title { font-size: 1.75rem; font-weight: 700; color: #1a1a1a; }
.titles .subtitle { color: #666; margin-top: 4px; }

.panel-card { border-radius: 18px; padding: 16px; direction: rtl; }
.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 4px 16px; }
.panel-title { display: flex; align-items: center; font-weight: 600; color: #1a1a1a; }
.panel-actions { display: flex; align-items: center; justify-content: flex-start; padding-top: 8px; }

.summary-card { border-radius: 18px; padding: 16px; direction: rtl; }
.summary-title { display: flex; align-items: center; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
.summary-item { display: flex; align-items: center; justify-content: space-between; background: #fafafa; border-radius: 14px; padding: 10px 12px; margin-top: 8px; }

.actions .elevate, .panel-actions .elevate { box-shadow: 0 8px 18px rgba(76, 175, 80, 0.28); }
.actions .elevate:hover, .panel-actions .elevate:hover { transform: translateY(-1px); }

@media (max-width: 600px) {
  .summary-item { font-size: 0.95rem; }
}
</style>
