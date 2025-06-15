export type NotificationType = 'alert' | 'info' | 'reminder';

export interface MockNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  is_read: boolean;
  link_to?: string;
}

export const mockNotificationsData: MockNotification[] = [
  {
    id: '1',
    type: 'alert',
    title: "Validation parentale requise",
    message: "L'inscription de Léo Dupont à 'Cours de Football U10' nécessite votre approbation.",
    date: new Date(Date.now() - 6 * 3600 * 1000), // 6 hours ago
    is_read: false,
    link_to: "/children/pending-validations", // Example link
  },
  {
    id: '2',
    type: 'reminder',
    title: "Activité bientôt !",
    message: "Rappel : Votre session de 'Yoga en Plein Air' commence demain à 9h00.",
    date: new Date(Date.now() - 12 * 3600 * 1000), // 12 hours ago
    is_read: false,
    link_to: "/activities/123", // Example activity ID
  },
  {
    id: '3',
    type: 'info',
    title: "Nouveau message de l'organisateur",
    message: "L'organisateur de 'Atelier Poterie Enfants' vous a envoyé un message concernant le matériel à apporter.",
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000), // 2 days ago
    is_read: true,
    link_to: "/messages/456", // Example message ID
  },
  {
    id: '4',
    type: 'alert',
    title: "Mise à jour importante : Annulation",
    message: "L'activité 'Sortie au Musée des Beaux-Arts' du 25/12 a été annulée par l'organisateur.",
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000), // 3 days ago
    is_read: true,
    link_to: "/activities/789", // Example activity ID
  },
  {
    id: '5',
    type: 'info',
    title: "Bienvenue sur InKlusif !",
    message: "Pensez à compléter votre profil pour accéder à toutes les fonctionnalités et aides disponibles.",
    date: new Date(Date.now() - 5 * 24 * 3600 * 1000), // 5 days ago
    is_read: true,
    link_to: "/complete-profile",
  },
];
