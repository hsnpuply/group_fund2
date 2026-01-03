<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const phoneNumber = ref("");
const errorMessage = ref("");
const phoneNumberInput = ref<any | null>(null);

const handleBack = () => {
  router.back();
};

const goToRegister = () => {
  router.push({ name: "Register" });
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
    // alert(`شماره موبایل وارد شده: ${phoneNumber.value}`);
    // router.push({
    // name: "Register",
    // params: { phone: phoneNumber.value },
    // });
  }
};

const isPhoneValid = () => {
  return phoneNumber.value.trim().length > 10;
};

const phoneInvalid = computed(() => {
  const v = phoneNumber.value.trim();
  return v.length > 0 && !v.startsWith("09");
});
onMounted(() => {
  nextTick(() => {
    // Vuetify v-text-field exposes a focus() method on the component instance
    // phoneNumberInput.value.focus();
    phoneNumberInput.value.focus();
  });
});
</script>

<template>
  <div class="login-container">
    <div
      class="login-card flex flex-col items-start gap-8 justify-center min-h-screen"
    >
      <h1 class="welcome-title text-4xl font-light text-right">خوش آمدید!</h1>
      <p class="subtitle">
        لطفا برای ورود شماره تلفن خود را وارد کنید.
      </p>
      <div class="w-full text-right">
        <v-text-field
          ref="phoneNumberInput"
          dir="rtl"
          id="phone"
          variant="outlined"
          v-model="phoneNumber"
          type="tel"
          :color="'#4caf50'"
          placeholder="مثال 09123456789"
          class="phone-input text-right transition-all duration-300 ease-in-out"
          maxlength="11"
          @input="
            () => {
              phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
              errorMessage = '';
            }
          "
          hide-details
          :error-messages="
            errorMessage ? [errorMessage] : phoneInvalid ? [''] : []
          "
          :prepend-inner-icon="phoneNumber ? 'mdi-close' : undefined"
          @click:prepend-inner="
            phoneNumber = '';
            errorMessage = '';
          "
          append-inner-icon="mdi-phone"
          :class="{ invalid: phoneInvalid, 'text-red-800': phoneInvalid }"
          @keyup.enter.prevent="isPhoneValid() ? handleSubmit() : null"
        />
        <div class="flex justify-between items-center mt-2 px-1">
          <p
            :class="{
              'text-red-700': phoneInvalid,
              'opacity-60': !phoneInvalid,
            }"
            class="text-[.9rem] transition-all duration-300"
          >
            شماره موبایل باید با 09 شروع شود.
          </p>
        </div>
      </div>
      <div class="login flex items-center gap-4 flex-col w-full">
        <v-btn
          class="w-[492px] !h-[50px] rounded-full text-white flex items-center active:translate-y-0.5 duration-200 justify-center mx-auto shadow-lg login-button"
          :disabled="!isPhoneValid()"
          variant="outlined"
          :class="isPhoneValid() ? '!bg-[#4caf50]' : '!bg-[#333]'"
          @click="handleSubmit"
        >
          ورود به اپلیکیشن
        </v-btn>
        <p
          dir="ltr"
          class="!text-sm text-black hover:text-[#388e3c] transition-colors duration-300 flex items-center gap-1"
        >
          کنید<span @click="goToRegister" class="cursor-pointer text-[#4caf50]"
            >ثبت نام
          </span>
          <span>حساب کاربری ندارید ؟</span>
        </p>
      </div>
      <!-- <p class="text-sm">
        با ثبت‌نام در اپلیکیشن،
        <span class="text-[#4caf50] cursor-pointer">قوانین و شرایط</span>
        و بیانیه
        <span class="text-[#4caf50] cursor-pointer">حریم خصوصی</span> را قبول
        می‌کنم.
      </p> -->
    </div>
  </div>
</template>
<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: start;
}

.login-card {
  width: 100%;
  max-width: 520px;
  text-align: center;
  direction: rtl;
  padding-top: 80px;
  padding-bottom: 40px;
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

.login-button.disabled {
  background-color: #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.arrow-icon {
  display: block;
  font-weight: 700;
}

.register-link {
  position: relative;
  padding: 4px 0;
}

/* Ensure placeholder and typed text stay in the same spot even when clear/phone icons appear */
.phone-input :deep(.v-field__wrap) {
  display: flex;
  align-items: center;
}
.phone-input :deep(.v-field__prepend-inner),
.phone-input :deep(.v-field__append-inner) {
  width: 44px; /* reserve space for icons */
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.phone-input :deep(.v-field__input),
.phone-input :deep(input) {
  padding-inline-end: 32px; /* reserve space for the clear/phone icons */
  padding-inline-start: 12px;
  transition: padding 0.16s ease;
  text-align: right;
}
.phone-input :deep(.v-field__input)::placeholder {
  text-align: right;
  opacity: 0.6;
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
  .phone-input .v-field__prepend-inner {
    order: 1;
  }
  .phone-input .v-field__append-inner {
    order: 2;
  }
  /* make the prepend-inner (clear icon) look clickable */
  .phone-input .v-field__prepend-inner .v-icon {
    cursor: pointer;
  }
}
</style>
