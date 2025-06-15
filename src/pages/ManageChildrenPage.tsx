import React, { useState, useEffect, useCallback } from 'react';
import childProfileService, { ChildProfile, ChildProfilePayload, ApiError } from '../../services/childProfileService';
import AddEditChildModal from '../../components/Dashboard/AddEditChildModal';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom'; // For future links if needed

const ManageChildrenPage: React.FC = () => {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For list loading
  const [apiError, setApiError] = useState<string | null>(null); // For list fetching errors
  
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [isSavingChild, setIsSavingChild] = useState(false); // For modal save operation

  const { addToast } = useToast();

  const fetchChildren = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await childProfileService.getChildProfiles();
      setChildren(data);
    } catch (err) {
      const error = err as ApiError;
      setApiError(error.message || "Erreur lors de la récupération des profils enfants.");
      addToast(error.message || "Erreur de récupération des profils.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleAddChildClick = () => {
    setEditingChild(null);
    setShowAddEditModal(true);
  };

  const handleEditChildClick = (child: ChildProfile) => {
    setEditingChild(child);
    setShowAddEditModal(true);
  };

  const handleDeleteChild = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce profil enfant ? Cette action est irréversible.")) {
      try {
        await childProfileService.deleteChildProfile(id);
        addToast("Profil enfant supprimé avec succès.", "success");
        fetchChildren(); // Refresh list
      } catch (err) {
        const error = err as ApiError;
        addToast(error.message || "Erreur lors de la suppression du profil.", "error");
      }
    }
  };

  const handleModalClose = () => {
    setShowAddEditModal(false);
    setEditingChild(null);
  };

  const handleModalSave = async (formData: ChildProfilePayload, id?: number): Promise<boolean> => {
    setIsSavingChild(true);
    try {
      if (id) { // Editing existing child
        await childProfileService.updateChildProfile(id, formData);
        addToast("Profil enfant mis à jour avec succès.", "success");
      } else { // Adding new child
        await childProfileService.addChildProfile(formData);
        addToast("Profil enfant ajouté avec succès.", "success");
      }
      fetchChildren(); // Refresh list
      handleModalClose();
      return true; // Indicate success
    } catch (err) {
      const error = err as ApiError;
      addToast(error.message || `Erreur lors de la sauvegarde du profil enfant.`, "error");
      return false; // Indicate failure
    } finally {
      setIsSavingChild(false);
    }
  };
  
  const formatDate = (dateString: string) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));

  // Styles
  const pageContainerStyle: React.CSSProperties = { maxWidth: '800px', margin: '2rem auto', padding: 'var(--global-padding, 16px)', fontFamily: 'var(--font-primary, Montserrat)' };
  const titleStyle: React.CSSProperties = { color: 'var(--color-blue-primary, #0055A4)', marginBottom: '1.5rem', textAlign: 'center' };
  const buttonStyle: React.CSSProperties = { marginBottom: '1.5rem', padding: '10px 15px', backgroundColor: 'var(--color-orange-primary)', color: 'white', border: 'none', borderRadius: 'var(--button-border-radius)', cursor: 'pointer', fontSize: '1rem' };
  const listContainerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' };
  const childCardStyle: React.CSSProperties = { backgroundColor: 'var(--color-background-card, #FFFFFF)', borderRadius: 'var(--card-border-radius, 8px)', padding: '1rem', boxShadow: 'var(--card-shadow, 0 2px 8px rgba(0,0,0,0.08))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' };
  const childInfoStyle: React.CSSProperties = { flexGrow: 1 };
  const childActionsStyle: React.CSSProperties = { display: 'flex', gap: '0.5rem', flexShrink: 0, marginTop: '0.5rem' };
  const actionButtonStyle: React.CSSProperties = { padding: '6px 10px', fontSize: '0.85rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid transparent' };


  return (
    <div style={pageContainerStyle}>
      <h1 style={titleStyle}>Gérer les Profils Enfants</h1>
      <button onClick={handleAddChildClick} style={buttonStyle} disabled={isLoading || isSavingChild}>
        + Ajouter un Enfant
      </button>

      {isLoading && <p>Chargement des profils...</p>}
      {apiError && <p style={{ color: 'red' }}>{apiError}</p>}
      
      {!isLoading && !apiError && children.length === 0 && (
        <p>Aucun profil enfant ajouté pour le moment. Cliquez sur "Ajouter un Enfant" pour commencer.</p>
      )}

      {!isLoading && !apiError && children.length > 0 && (
        <div style={listContainerStyle}>
          {children.map(child => (
            <div key={child.id} style={childCardStyle}>
              <div style={childInfoStyle}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{child.first_name} {child.last_name}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Date de naissance: {formatDate(child.date_of_birth)}</p>
                {child.additional_info && <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>Notes: {child.additional_info}</p>}
              </div>
              <div style={childActionsStyle}>
                <Link 
                  to={`/dashboard/child-activities/${child.id}`} 
                  style={{...actionButtonStyle, backgroundColor: 'var(--color-success-light, #E7F5E8)', color: 'var(--color-success-dark, #2ECC71)', textDecoration: 'none'}}
                  title={`Voir les activités pour ${child.first_name}`}
                >
                  Voir les Activités
                </Link>
                <button onClick={() => handleEditChildClick(child)} style={{...actionButtonStyle, backgroundColor: 'var(--color-blue-primary-light, #E8F5FF)', color: 'var(--color-blue-primary)'}} disabled={isSavingChild}>Modifier</button>
                <button onClick={() => handleDeleteChild(child.id)} style={{...actionButtonStyle, backgroundColor: 'var(--color-error-light, #FDECEA)', color: 'var(--color-error)'}} disabled={isSavingChild}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEditChildModal 
        isOpen={showAddEditModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initialData={editingChild}
        isLoading={isSavingChild}
      />
    </div>
  );
};

export default ManageChildrenPage;