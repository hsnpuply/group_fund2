import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

export function useRegister() {
  const router = useRouter();
  const toast = useToast();

  // State
  const phoneNumber = ref('');
  const fullName = ref('');
  const errorMessage = ref('');
  const isLoading = ref(false);

  // Validation
  const phoneInvalid = computed(() => {
    const v = phoneNumber.value.trim();
    return v.length > 0 && !v.startsWith('09');
  });

  const isPhoneValid = computed(() => {
    return phoneNumber.value.trim().length === 11 && phoneNumber.value.startsWith('09');
  });

  const isFullNameValid = computed(() => {
    return fullName.value.trim().length >= 3;
  });

  const canSubmit = computed(() => {
    return isPhoneValid.value && isFullNameValid.value && !isLoading.value;
  });

  // Methods
  const handleSubmit = async () => {
    if (!canSubmit.value) return;

    isLoading.value = true;
    errorMessage.value = '';

    try {
      // TODO: Call API to register and send OTP
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      toast.success('کد تایید ارسال شد');
      
      // Navigate to OTP page using query params
      router.push({
        path: '/register/otp',
        query: { 
          phone: phoneNumber.value,
          name: fullName.value 
        }
      });
    } catch (error: any) {
      errorMessage.value = error.message || 'خطایی رخ داده است';
      toast.error(errorMessage.value);
    } finally {
      isLoading.value = false;
    }
  };

  const goToLogin = () => {
    router.push({ name: 'Login' });
  };

  const handlePhoneInput = (value: string) => {
    phoneNumber.value = value.replace(/[^0-9]/g, '');
    errorMessage.value = '';
  };

  return {
    // State
    phoneNumber,
    fullName,
    errorMessage,
    isLoading,
    
    // Computed
    phoneInvalid,
    isPhoneValid,
    isFullNameValid,
    canSubmit,
    
    // Methods
    handleSubmit,
    goToLogin,
    handlePhoneInput
  };
}
