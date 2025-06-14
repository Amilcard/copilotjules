import { useState, useEffect, useCallback } from 'react';

function useFormAutoSave<T extends Record<string, any>>(formId: string, initialData: T) {
  const [formData, setFormData] = useState<T>(() => {
    try {
      const savedData = localStorage.getItem(formId);
      if (savedData) {
        // Ensure the saved data structure matches or is compatible with initialData keys
        // This is a shallow check; deeper validation might be needed for complex objects
        const parsedData = JSON.parse(savedData) as T;
        const initialKeys = Object.keys(initialData);
        const savedKeys = Object.keys(parsedData);
        
        // A simple check to see if essential keys are present, might need more robust merging/validation
        const hasSameCoreStructure = initialKeys.every(key => savedKeys.includes(key));

        if (hasSameCoreStructure) {
            // Merge to ensure new fields in initialData are present if savedData is older
            return { ...initialData, ...parsedData };
        }
      }
    } catch (error) {
      console.error(`Error loading saved form data for ${formId}:`, error);
      // Fallback to initialData if parsing fails or structure is incompatible
    }
    return initialData;
  });

  useEffect(() => {
    // Debounce saving to localStorage if formData changes too rapidly (optional)
    // For this version, saving directly on each change.
    try {
      localStorage.setItem(formId, JSON.stringify(formData));
    } catch (error) {
      console.error(`Error saving form data for ${formId}:`, error);
    }
  }, [formData, formId]);

  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(formId);
      // Optionally, reset formData to initialData after clearing,
      // or let the component using the hook decide.
      // For now, it just clears localStorage. The component might re-initialize with initialData on next load if not handled.
      // setFormData(initialData); // If immediate reset is desired.
      console.log(`Cleared saved data for form: ${formId}`);
    } catch (error) {
      console.error(`Error clearing form data for ${formId}:`, error);
    }
  }, [formId/*, initialData*/]); // Add initialData if setFormData(initialData) is used above

  // Custom setter that mimics useState's setter but also allows direct object update
  const updateFormData = useCallback((value: T | ((prevState: T) => T)) => {
    setFormData(value);
  }, []);


  // Helper to update a single field, common in forms
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    
    let processedValue: string | number | boolean = value;

    if (type === 'checkbox') {
      // Assuming CheckboxChangeEvent is used if it's a custom component or has 'checked'
      const checkboxEvent = event.target as HTMLInputElement;
      processedValue = checkboxEvent.checked;
    } else if (type === 'number') {
      processedValue = value === '' ? '' : Number(value); // Keep empty string for controlled number inputs, or parse
    }
    // Add other type handlings if necessary (e.g., 'file')

    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: processedValue,
    }));
  }, []);


  return { formData, setFormData: updateFormData, clearSavedData, handleChange };
}

export default useFormAutoSave;
