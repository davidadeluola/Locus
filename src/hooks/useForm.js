import { useState } from "react";

/**
 * useForm Hook for LOCUS System Identity
 * @param {Object} initialValues - The starting state of the form
 */
export const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);

  // Handles standard input, select, and textarea changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Support for checkboxes if needed, otherwise use value
    const finalValue = type === "checkbox" ? checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  // Manual setter for custom components (like your SchoolSelector)
  const setFieldValue = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => setValues(initialValues);

  return {
    values,
    handleChange,
    setFieldValue,
    resetForm,
  };
};
