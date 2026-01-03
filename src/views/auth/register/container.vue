<script>
/**
 * @component RegisterContainer
 * @description User registration container component
 * @version 2.0.0
 */
import { ref, computed, reactive } from "vue";
import { useForm, useField } from 'vee-validate';
import * as yup from "yup";

const handleRegister = () => {
  // Registration logic goes here
};

const state = reactive({
  isLoading: false,
  phoneNumber: "",
  verificationCode: "",
});

// Form validation schema
const schema = yup.object({
  phoneNumber: yup.string().required('شماره همراه الزامی است').matches(/^09\d{9}$/, 'شماره همراه باید با 09 شروع شود'),
  verificationCode: yup.string().required('کد تایید الزامی است').min(5, 'کد تایید باید ۵ رقم باشد'),
});

// Form setup
const { handleSubmit, errors } = useForm({
  validationSchema: schema,
  initialValues: {
    phoneNumber: "",
    verificationCode: "",
  },
});

// Fields
const { value: phoneNumber } = useField('phoneNumber');
const { value: verificationCode } = useField('verificationCode');

// Computed
const isLoading = computed(() => state.isLoading);
const canSubmit = computed(() => !isLoading.value && phoneNumber.value && verificationCode.value);

// Submit handler
const submit = handleSubmit(async (values) => {
  state.isLoading = true;
  try {
    await handleRegister();
  } finally {
    state.isLoading = false;
  }
});
</script>
<template>
  <div
    dir="rtl"
    class="register-container bg-gray-100 pa-6 rounded-lg w-96 mx-auto mt-12"
  >
    <v-tabs color="primary" align-tabs="center">
      <v-tab value="one">شماره همراه</v-tab>
      <v-tab value="two">نام کاربری</v-tab>
    </v-tabs>
    <Transition name="fade">
      <div v-if="true" class="mt-6">
        <form @submit.prevent="submit">
          <v-text-field
            v-model="phoneNumber"
            label="شماره همراه"
            :disabled="isLoading"
            :error-messages="errors.phoneNumber"
            autocomplete="tel"
            dir="ltr"
          >
            <template #prepend-inner>
              <v-icon color="primary" size="20">mdi-cellphone</v-icon>
            </template>
          </v-text-field>

          <v-text-field
            v-model="verificationCode"
            label="کد تایید"
            :disabled="isLoading"
            :error-messages="errors.verificationCode"
            autocomplete="one-time-code"
            dir="ltr"
          >
            <template #prepend-inner>
              <v-icon color="primary" size="20">mdi-shield-key</v-icon>
            </template>
          </v-text-field>

          <v-btn
            color="primary"
            size="large"
            :loading="isLoading"
            :disabled="!canSubmit"
            type="submit"
            block
            class="mt-4"
          >
            <v-icon start>mdi-account-plus</v-icon>
            ثبت نام
          </v-btn>
        </form>
      </div>
    </Transition>
  </div>
</template>
<style scoped></style>
