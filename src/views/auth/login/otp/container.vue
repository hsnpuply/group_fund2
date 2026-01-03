<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";

const router = useRouter();
const route = useRoute();
const toast = useToast();

// Read phone from route params or query if provided
const phone = ref<string>(
  (route.params.phone as string) ||
    (route.query.phone as string) ||
    "09928717698"
);

const inputs = ref<string[]>(Array.from({ length: 6 }).map(() => ""));
const inputEls = ref<HTMLInputElement[]>([]);
const isVerifying = ref(false);
const isResending = ref(false);
const hasError = ref(false);

const setInputRef = (el: any, i: number) => {
  if (el) inputEls.value[i] = el;
};

const countdown = ref<number>(120);
let timerId: number | null = null;

const formattedCountdown = computed(() => {
  const mins = Math.floor(countdown.value / 60);
  const secs = countdown.value % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
});

const canResend = computed(() => countdown.value === 0 && !isResending.value);

const startTimer = () => {
  countdown.value = 120;
  if (timerId) window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    if (countdown.value > 0) countdown.value -= 1;
    else if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }, 1000);
};

const focusAt = (i: number) => {
  nextTick(() => {
    const el = inputEls.value[i];
    if (el) el.focus();
  });
};

const onInput = (i: number, e: Event) => {
  hasError.value = false;
  const input = e.target as HTMLInputElement;
  const v = input.value.replace(/[^0-9]/g, "");

  if (v.length > 1) {
    // Handle paste or multiple characters
    const chars = v.split("");
    for (let j = 0; j < chars.length && i + j < inputs.value.length; j++) {
      const char = chars[j];
      if (char !== undefined) {
        inputs.value[i + j] = char;
      }
    }
    const nextIndex = Math.min(i + v.length, inputs.value.length - 1);
    focusAt(nextIndex);
  } else {
    inputs.value[i] = v;
    if (v && i < inputs.value.length - 1) {
      focusAt(i + 1);
    }
  }

  // After any change, if all inputs filled check the code
  const current = inputs.value.join("");
  if (current.length === inputs.value.length) {
    verifyOTP(current);
  }
};

const verifyOTP = async (code: string) => {
  if (isVerifying.value) return;
  isVerifying.value = true;
  hasError.value = false;

  try {
    // TODO: Call API to verify OTP
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (code === "111111") {
      toast.success("ورود با موفقیت انجام شد");
      setTimeout(() => {
        router.push({ path: "/dashboard" }).catch(() => {});
      }, 600);
    } else {
      hasError.value = true;
      toast.error("کد وارد شده صحیح نیست");
      setTimeout(() => {
        inputs.value = Array.from({ length: 6 }).map(() => "");
        focusAt(0);
        hasError.value = false;
      }, 600);
    }
  } catch (error: any) {
    hasError.value = true;
    toast.error(error.message || "خطایی رخ داده است");
    setTimeout(() => {
      inputs.value = Array.from({ length: 6 }).map(() => "");
      focusAt(0);
      hasError.value = false;
    }, 600);
  } finally {
    isVerifying.value = false;
  }
};

const onKeydown = (i: number, e: KeyboardEvent) => {
  if (e.key === "Backspace") {
    if (inputs.value[i]) {
      inputs.value[i] = "";
    } else if (i > 0) {
      focusAt(i - 1);
      inputs.value[i - 1] = "";
    }
  } else if (e.key === "ArrowLeft" && i > 0) {
    focusAt(i - 1);
  } else if (e.key === "ArrowRight" && i < inputs.value.length - 1) {
    focusAt(i + 1);
  }
};

const resend = async () => {
  if (!canResend.value) return;
  isResending.value = true;

  try {
    // TODO: Call API to resend OTP
    await new Promise((resolve) => setTimeout(resolve, 800));

    startTimer();
    inputs.value = Array.from({ length: 6 }).map(() => "");
    focusAt(0);
    toast.success("کد تایید مجدداً ارسال شد");
  } catch (error: any) {
    toast.error(error.message || "خطا در ارسال مجدد کد");
  } finally {
    isResending.value = false;
  }
};

const editPhone = () => {
  router.back();
};

onMounted(() => {
  nextTick(() => {
    focusAt(0);
    startTimer();
  });
});

onUnmounted(() => {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
});
</script>

<template>
  <div class="otp-page">
    <!-- Decorative background elements -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="otp-container">
      <!-- Back Button -->
      <button class="back-btn" @click="router.back()">
        <v-icon size="24">mdi-arrow-right</v-icon>
      </button>

      <!-- Header Section -->
      <div class="header-section">
        <div class="icon-wrapper">
          <v-icon size="48" color="#4caf50">mdi-shield-check</v-icon>
        </div>
        <h1 class="title">تایید کد ورود</h1>
        <p class="subtitle">
          کد ۶ رقمی ارسال شده به شماره
          <span class="phone-highlight" dir="ltr">{{ phone }}</span>
          را وارد کنید
        </p>
      </div>

      <!-- OTP Input Section -->
      <div
        class="otp-inputs-wrapper"
        :class="{ 'shake-error': hasError }"
        dir="ltr"
        role="group"
        aria-label="کد تایید"
      >
        <input
          v-for="(_, i) in inputs"
          :key="i"
          :ref="(el) => setInputRef(el, i)"
          class="otp-input"
          :class="{
            filled: inputs[i],
            error: hasError,
            'focus-ring': !hasError,
          }"
          inputmode="numeric"
          maxlength="1"
          autocomplete="one-time-code"
          :disabled="isVerifying"
          @input="(e) => onInput(i, e)"
          @keydown="(e) => onKeydown(i, e)"
          :value="inputs[i]"
        />
      </div>

      <!-- Loading indicator -->
      <div v-if="isVerifying" class="verifying-indicator">
        <v-progress-circular
          indeterminate
          color="#4caf50"
          size="24"
          width="2"
        ></v-progress-circular>
        <span>در حال بررسی...</span>
      </div>

      <!-- Resend Section -->
      <div class="resend-section">
        <div class="timer-display" v-if="countdown > 0">
          <v-icon size="18" class="me-1 opacity-60">mdi-clock-outline</v-icon>
          <span class="timer-text">ارسال مجدد تا</span>
          <span class="timer-value">{{ formattedCountdown }}</span>
        </div>

        <button
          v-else
          class="resend-btn"
          :class="{ loading: isResending }"
          :disabled="isResending"
          @click="resend"
        >
          <v-icon size="18" class="me-1">mdi-refresh</v-icon>
          <span>ارسال مجدد کد</span>
        </button>
      </div>

      <!-- Edit Phone Link -->
      <div class="edit-phone-section">
        <span class="edit-text">شماره اشتباه است؟</span>
        <button class="edit-btn" @click="editPhone">
          <span>ویرایش شماره</span>
          <v-icon size="16">mdi-pencil</v-icon>
        </button>
      </div>

      <!-- Help Text -->
      <div class="help-section">
        <v-icon size="16" class="me-1 opacity-50">mdi-information-outline</v-icon>
        <span>کد تست: 111111</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.otp-page {
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

.otp-container {
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

.back-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f5f5f5;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #666;
}

.back-btn:hover {
  background: #eeeeee;
  color: #333;
  transform: translateX(2px);
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 32px;
  padding-top: 20px;
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
  margin-bottom: 12px;
}

.subtitle {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.7;
}

.phone-highlight {
  font-weight: 600;
  color: #4caf50;
  background: #e8f5e9;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-block;
  margin: 4px 0;
}

/* OTP Inputs */
.otp-inputs-wrapper {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.otp-input {
  width: 52px;
  height: 60px;
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  background: #fafafa;
  outline: none;
  transition: all 0.2s ease;
  caret-color: #4caf50;
}

.otp-input:focus {
  border-color: #4caf50;
  background: white;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
}

.otp-input.filled {
  border-color: #81c784;
  background: #f1f8e9;
}

.otp-input.error {
  border-color: #ef5350;
  background: #ffebee;
  animation: shake 0.4s ease-in-out;
}

.otp-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

.shake-error {
  animation: shake 0.4s ease-in-out;
}

/* Verifying indicator */
.verifying-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 20px;
  color: #4caf50;
  font-size: 0.9rem;
}

/* Resend Section */
.resend-section {
  text-align: center;
  margin-bottom: 20px;
}

.timer-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: #f5f5f5;
  border-radius: 12px;
  color: #666;
  font-size: 0.9rem;
}

.timer-value {
  font-weight: 600;
  color: #4caf50;
  min-width: 36px;
  font-variant-numeric: tabular-nums;
}

.resend-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4caf50, #43a047);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.resend-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.resend-btn:active {
  transform: translateY(0);
}

.resend-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Edit Phone Section */
.edit-phone-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 0.85rem;
}

.edit-text {
  color: #888;
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4caf50;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #e8f5e9;
}

/* Help Section */
.help-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px;
  background: #fff8e1;
  border-radius: 10px;
  font-size: 0.8rem;
  color: #f57c00;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .otp-page {
    padding: 16px;
    align-items: flex-start;
    padding-top: 40px;
  }

  .otp-container {
    padding: 32px 20px;
    border-radius: 20px;
  }

  .back-btn {
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
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

  .otp-inputs-wrapper {
    gap: 8px;
  }

  .otp-input {
    width: 44px;
    height: 52px;
    font-size: 1.25rem;
    border-radius: 10px;
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
