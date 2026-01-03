<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const phoneNumber = ref("");
const errorMessage = ref("");

const handleBack = () => {
  router.back();
};

const handleSubmit = () => {
  //   if (phoneNumber.value.trim()) {
  //     alert(`شماره موبایل وارد شده: ${phoneNumber.value}`);
  //     // Navigate to OTP verification
  //     // router.push({
  //     //   name: "otp",
  //     //   params: { phone: phoneNumber.value },
  //     // });
  //   }
  if (!phoneInvalid.value) {
    alert(`شماره موبایل وارد شده: ${phoneNumber.value}`);
    // router.push({
    // name: "Register",
    // params: { phone: phoneNumber.value },
    // });
    // alert(`شماره موبایل وارد شده: ${phoneNumber.value}`);
  }
};

const isPhoneValid = () => {
  return phoneNumber.value.trim().length > 10;
};

const phoneInvalid = computed(() => {
  const v = phoneNumber.value.trim();
  return v.length > 0 && !v.startsWith("09");
});
</script>

<template>
  <div class="login-container bg-[#333] text-white flex flex-col">
    <div class="login-card flex flex-col items-start gap-8">
      <h1 class="welcome-title text-4xl font-light text-right">خوش آمدید!</h1>
      <p class="subtitle">
        <!-- لطفاً شماره‌ موبایلتان را وارد کنید تا بتوانیم با شما در ارتباط باشیم. -->
        لطفا برای ورود شماره تلفن خود را وارد کنید.
      </p>
      <div class="flex-1 w-full text-right">
        <!-- <label for="phone" class="input-label">شماره موبایل</label> -->
        <v-text-field
          dir="rtl"
          id="phone"
          variant="outlined"
          v-model="phoneNumber"
          type="tel"
          :color="'#4caf50'"
          placeholder="مثال 09123456789"
          class="phone-input text-right transition-all duration-300 ease-in-out "
          maxlength="11"
          @input="() => { phoneNumber = phoneNumber.replace(/[^0-9]/g, ''); errorMessage = '' }"
          hide-details
          :error-messages="errorMessage ? [errorMessage] : (phoneInvalid ? [''] : [])"
          :prepend-inner-icon="phoneNumber ? 'mdi-close' : undefined"
          @click:prepend-inner="phoneNumber = ''; errorMessage = ''"
          append-inner-icon="mdi-phone"
          :class="{ invalid: phoneInvalid,
            'text-red-800': phoneInvalid
           }"
          @keyup.enter.prevent="handleSubmit"
        />
        <p :class="{ 'text-red-700': phoneInvalid }" class="text-sm mt-2">
          شماره موبایل باید با 09 شروع شود.
        </p>
      </div>

      <p class="text-sm">
        با ثبت‌نام در اپلیکیشن،
        <span class="text-[#4caf50] cursor-pointer">قوانین و شرایط</span>
        و بیانیه
        <span class="text-[#4caf50] cursor-pointer">حریم خصوصی</span> را قبول
        می‌کنم.
      </p>
    </div>
    <button
      class="w-14 h-14 rounded-full bg-gray-400 text-white flex items-center justify-center mt-8 mx-auto shadow-lg login-button"
      :disabled="isPhoneValid()"
      :class="{ '!bg-[#4caf50]': isPhoneValid() }"
      @click="handleSubmit"
    >
      <span class="arrow-icon">→</span>
    </button>
  </div>
</template>
<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: start;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 520px;
  padding: 40px 30px;
  text-align: center;
  direction: rtl;
}

.subtitle {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  /* margin: 0 0 32px 0; */
  font-weight: 400;
}

.input-label {
  display: block;
  font-size: 12px;
  color: #999999;
  margin-bottom: 8px;
  font-weight: 500;
  text-align: right;
}

.terms-text {
  font-size: 12px;
  color: #999999;
  line-height: 1.5;
  margin: 0 0 32px 0;
  font-weight: 400;
}

.terms-text a {
  color: #4caf50;
  text-decoration: none;
}

.login-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  color: white;
  background-color: #9e9e9e;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.login-button.disabled {
  background-color: #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.arrow-icon {
  display: block;
  font-weight: 700;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 20px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .phone-input {
    /* padding: 12px 14px; */
    font-size: 16px;
  }

  /* swap prepend/append inside this field so clear (prepend-inner) appears visually on the left
     and phone icon (append-inner) appears on the right regardless of RTL swapping */
  .phone-input .v-field__wrap {
    display: flex;
    align-items: center;
  }
  .phone-input .v-field__prepend-inner { order: 1; }
  .phone-input .v-field__append-inner { order: 2; }
  /* make the prepend-inner (clear icon) look clickable */
  .phone-input .v-field__prepend-inner .v-icon { cursor: pointer; }
}
</style>
