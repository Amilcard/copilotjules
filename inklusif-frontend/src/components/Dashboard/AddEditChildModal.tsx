import React, { useState, useEffect } from 'react';
import { ChildProfile, ChildProfilePayload } from '../../services/childProfileService';
import useFormAutoSave from '../../hooks/useFormAutoSave'; // Optional: for auto-saving modal form

interface AddEditChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ChildProfilePayload, id?: number) => Promise<boolean>; // Returns true on success, false on failure
  initialData: ChildProfile | null; // For editing
  isLoading?: boolean; // Controlled by parent during API call
}

const initialModalFormData = {
  first_name: '',
  last_name: '',
  date_of_birth: '', // YYYY-MM-DD
  additional_info: '',
};

const AddEditChildModal: React.FC<AddEditChildModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  isLoading = false 
}) => {
  const formId = initialData ? `editChildForm-${initialData.id}` : 'addChildForm';
  const { 
    formData, 
    setFormData, // Using setFormData from hook directly
    handleChange, 
    clearSavedData 
  } = useFormAutoSave(formId, initialData ? 
    { 
      first_name: initialData.first_name, 
      last_name: initialData.last_name,
      date_of_birth: initialData.date_of_birth.split('T')[0], // Format to YYYY-MM-DD for input type="date"
      additional_info: initialData.additional_info || ''
    } : initialModalFormData
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name,
        last_name: initialData.last_name,
        date_of_birth: initialData.date_of_birth.split('T')[0], // Ensure YYYY-MM-DD
        additional_info: initialData.additional_info || '',
      });
    } else {
      setFormData(initialModalFormData); // Reset for new child
    }
    setErrors({}); // Clear errors when initialData changes or modal opens/closes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]); // Rerun if initialData changes or modal re-opens

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = "Le prénom est requis.";
    if (!formData.last_name.trim()) newErrors.last_name = "Le nom de famille est requis.";
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "La date de naissance est requise.";
    } else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      today.setHours(0,0,0,0); // Compare dates only
      if (dob >= today) {
        newErrors.date_of_birth = "La date de naissance doit être dans le passé.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const payload: ChildProfilePayload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      date_of_birth: formData.date_of_birth, // Already YYYY-MM-DD
      additional_info: formData.additional_info?.trim() || undefined,
    };
    
    const success = await onSave(payload, initialData?.id);
    if (success) {
      clearSavedData(); // Clear auto-saved data on successful save
      // onClose(); // Parent will handle closing on success from onSave
    }
  };

  if (!isOpen) return null;

  // Styles (inline for brevity, can be moved to CSS modules)
  const modalOverlayStyle: React.CSSProperties = { /* ... similar to Onboarding ... */ zIndex: 2000, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const modalContentStyle: React.CSSProperties = { backgroundColor: 'white', padding: '25px', borderRadius: '8px', maxWidth: '450px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', marginBottom: '5px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const errorTextStyle: React.CSSProperties = { color: 'red', fontSize: '0.8em', marginBottom: '10px' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: 'var(--color-blue-primary)', marginBottom: '20px', textAlign: 'center' }}>
          {initialData ? `Modifier le Profil de ${initialData.first_name}` : 'Ajouter un Enfant'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="first_name">Prénom <span style={{color: 'red'}}>*</span></label>
            <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} style={inputStyle} required />
            {errors.first_name && <p style={errorTextStyle}>{errors.first_name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Nom de famille <span style={{color: 'red'}}>*</span></label>
            <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} style={inputStyle} required />
            {errors.last_name && <p style={errorTextStyle}>{errors.last_name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="date_of_birth">Date de naissance <span style={{color: 'red'}}>*</span></label>
            <input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} style={inputStyle} required />
            {errors.date_of_birth && <p style={errorTextStyle}>{errors.date_of_birth}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="additional_info">Informations supplémentaires (allergies, notes, etc.)</label>
            <textarea id="additional_info" name="additional_info" value={formData.additional_info || ''} onChange={handleChange} style={{...inputStyle, minHeight: '80px'}} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} disabled={isLoading} className="button-link secondary" style={{backgroundColor: '#eee', color: '#333', borderColor: '#ccc'}}>Annuler</button>
            <button type="submit" disabled={isLoading} className="button-link primary">
              {isLoading ? 'Sauvegarde...' : (initialData ? 'Mettre à jour' : 'Ajouter Enfant')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditChildModal;
