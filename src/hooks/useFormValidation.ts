import { useCallback, useState } from "react";

interface ValidationRule{
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  message?: string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormValues {
  [key: string]: string | number | boolean;
}

interface FormErrors {
  [key: string]: string;
}

export const useFormValidation = <T extends FormValues>(initialState: T, validationRules: ValidationRules) => {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const validate = useCallback(() => {
    const newErrors: FormErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = values[field];
      
      if (rule.required && (!value || value === '')) {
        newErrors[field] = rule.message || `${field} is required`;
      } else if (value && rule.pattern && !rule.pattern.test(String(value))) {
        newErrors[field] = rule.message || `${field} format is invalid`;
      } else if (value && rule.minLength && String(value).length < rule.minLength) {
        newErrors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
      } else if (value && rule.maxLength && String(value).length > rule.maxLength) {
        newErrors[field] = rule.message || `${field} must not exceed ${rule.maxLength} characters`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const validateField = useCallback((field: string) => {
    const rule = validationRules[field];
    if (!rule) return true;

    const value = values[field];
    let error = '';

    if (rule.required && (!value || value === '')) {
      error = rule.message || `${field} is required`;
    } else if (value && rule.pattern && !rule.pattern.test(String(value))) {
      error = rule.message || `${field} format is invalid`;
    } else if (value && rule.minLength && String(value).length < rule.minLength) {
      error = rule.message || `${field} must be at least ${rule.minLength} characters`;
    } else if (value && rule.maxLength && String(value).length > rule.maxLength) {
      error = rule.message || `${field} must not exceed ${rule.maxLength} characters`;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return !error;
  }, [values, validationRules]);

  const handleChange = useCallback((field: string, value: string | number | boolean) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate field if it's been touched
    if (touched[field]) {
      validateField(field);
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field);
  }, [validateField]);

  const resetForm = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialState]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValues,
    setIsSubmitting,
    validate,
    validateField,
    handleChange,
    handleBlur,
    resetForm,
    isValid: Object.keys(errors).length === 0
  };
};