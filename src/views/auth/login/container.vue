<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const phoneNumber = ref("");
const errorMessage = ref("");
const phoneNumberInput = ref<any | null>(null);

const goToRegister = () => {
  router.push({ name: "Register" });
};

const handleSubmit = () => {
  if (isPhoneValid.value) {
    router.push({
      name: "otp",
      params: { phone: phoneNumber.value },
    });
  }
};

const isPhoneValid = computed(() => {
  return phoneNumber.value.trim().length === 11 && phoneNumber.value.startsWith("09");
});

const phoneInvalid = computed(() => {
  const v = phoneNumber.value.trim();
  return v.length > 0 && !v.startsWith("09");
});

const handlePhoneInput = () => {
  phoneNumber.value = phoneNumber.value.replace(/[^0-9]/g, "");
  errorMessage.value = "";
};

onMounted(() => {
  nextTick(() => {
    phoneNumberInput.value?.focus();
  });
});
</script>

<template>
  <div class="login-page">
    <!-- Decorative background elements -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="icon-wrapper">
          <v-icon size="48" color="#4caf50">mdi-login-variant</v-icon>
        </div>
        <h1 class="title">خوش آمدید!</h1>
        <p class="subtitle">
          برای ورود به حساب کاربری شماره موبایل خود را وارد کنید
        </p>
      </div>

      <!-- Form Section -->
      <div class="form-section">
        <div class="input-group">
          <label class="input-label">
            <v-icon size="18" class="me-1">mdi-phone-outline</v-icon>
            شماره موبایل
          </label>
          <v-text-field
            ref="phoneNumberInput"
            dir="rtl"
            variant="outlined"
            v-model="phoneNumber"
            type="tel"
            :color="'#4caf50'"
            placeholder="09123456789"
            class="premium-input"
            :class="{ 'has-error': phoneInvalid }"
            maxlength="11"
            @input="handlePhoneInput"
            hide-details
            density="comfortable"
            :error="phoneInvalid"
            @keyup.enter.prevent="isPhoneValid ? handleSubmit() : null"
          >
            <template #prepend-inner>
              <v-icon
                v-if="phoneNumber && !phoneInvalid"
                @click="
                  phoneNumber = '';
                  errorMessage = '';
                "
                size="20"
                class="clear-icon"
              >
                mdi-close-circle
              </v-icon>
              <v-icon
                v-if="isPhoneValid"
                color="#4caf50"
                size="20"
                class="check-icon ms-1"
              >
                mdi-check-circle
              </v-icon>
            </template>
            <template #append-inner>
              <v-icon size="20" :color="phoneInvalid ? '#ef5350' : '#9e9e9e'">
                mdi-phone
              </v-icon>
            </template>
          </v-text-field>

          <!-- Error/Helper text -->
          <div class="helper-row">
            <p
              class="helper-text"
              :class="{ error: phoneInvalid }"
            >
              <v-icon size="14" class="me-1">
                {{ phoneInvalid ? 'mdi-alert-circle' : 'mdi-information-outline' }}
              </v-icon>
              شماره موبایل باید با 09 شروع شود
            </p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <v-btn
        class="submit-btn"
        :disabled="!isPhoneValid"
        size="x-large"
        block
        @click="handleSubmit"
      >
        <v-icon class="me-2">mdi-arrow-left</v-icon>
        ورود به حساب
      </v-btn>

      <!-- Register Link -->
      <div class="register-link-section">
        <span class="register-text">حساب کاربری ندارید؟</span>
        <button class="register-btn" @click="goToRegister">
          <span>ایجاد حساب</span>
          <v-icon size="18">mdi-account-plus</v-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8faf8 0%, #e8f5e9 100%);
  position: relative;
  overflow: hidden;
}

/* Decorative background */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: #4caf50;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: #81c784;
  bottom: -50px;
  left: -50px;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: #a5d6a7;
  top: 50%;
  left: 10%;
}

.login-container {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 20px 60px rgba(76, 175, 80, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.06);
  position: relative;
  direction: rtl;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 32px;
}

.icon-wrapper {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.2);
}

.title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
}

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #444;
}

.premium-input {
  --v-field-border-opacity: 0.2;
}

.premium-input :deep(.v-field) {
  border-radius: 14px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.premium-input :deep(.v-field--focused) {
  background: white;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
}

.premium-input :deep(.v-field__input) {
  padding: 12px 16px;
  font-size: 1rem;
}

.premium-input :deep(input) {
  text-align: right;
}

.premium-input :deep(input::placeholder) {
  color: #bbb;
  text-align: right;
}

.premium-input.has-error :deep(.v-field) {
  background: #fff5f5;
}

.check-icon {
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.clear-icon {
  cursor: pointer;
  color: #999;
  transition: color 0.2s ease;
}

.clear-icon:hover {
  color: #666;
}

.helper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.helper-text {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #888;
  transition: color 0.2s ease;
}

.helper-text.error {
  color: #ef5350;
}

/* Submit Button */
.submit-btn {
  height: 56px !important;
  border-radius: 14px !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  background: linear-gradient(135deg, #4caf50, #43a047) !important;
  color: white !important;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.35) !important;
  transition: all 0.3s ease !important;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(76, 175, 80, 0.45) !important;
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: linear-gradient(135deg, #bdbdbd, #9e9e9e) !important;
  box-shadow: none !important;
}

/* Register Link Section */
.register-link-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.register-text {
  color: #888;
  font-size: 0.9rem;
}

.register-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4caf50;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.register-btn:hover {
  background: #e8f5e9;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .login-page {
    padding: 16px;
    align-items: flex-start;
    padding-top: 40px;
  }

  .login-container {
    padding: 32px 20px;
    border-radius: 20px;
  }

  .icon-wrapper {
    width: 72px;
    height: 72px;
  }

  .icon-wrapper .v-icon {
    font-size: 36px !important;
  }

  .title {
    font-size: 1.5rem;
  }

  .submit-btn {
    height: 52px !important;
  }

  .circle-1 {
    width: 250px;
    height: 250px;
    top: -80px;
    right: -80px;
  }

  .circle-2 {
    width: 180px;
    height: 180px;
  }

  .circle-3 {
    display: none;
  }
}
</style>
