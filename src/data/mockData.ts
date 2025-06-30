
import { Driver, Race } from '@/types/championship';

export const drivers: Driver[] = [
  { id: '1', name: 'Jean-Luc Martin', team: 'Team Caribbean Racing', number: 1 },
  { id: '2', name: 'Marie Dubois', team: 'Gwada Speed', number: 7 },
  { id: '3', name: 'Pierre Lafleur', team: 'Island Motors', number: 3 },
  { id: '4', name: 'Sophie Celestin', team: 'Team Caribbean Racing', number: 11 },
  { id: '5', name: 'Antoine Morel', team: 'Volcano Racing', number: 22 },
  { id: '6', name: 'Isabelle Joseph', team: 'Gwada Speed', number: 44 },
  { id: '7', name: 'Michel Badeaux', team: 'Island Motors', number: 17 },
  { id: '8', name: 'Caroline Noel', team: 'Sugar Cane Racing', number: 88 },
  { id: '9', name: 'Frédéric Palmier', team: 'Volcano Racing', number: 33 },
  { id: '10', name: 'Sylvie Moreau', team: 'Tropical Speed', number: 55 }
];

export const montagneRaces: Race[] = [
  {
    id: 'mont1',
    name: 'Course de Côte de la Soufrière',
    date: '2024-03-15',
    type: 'montagne',
    results: [
      { driverId: '1', position: 1, points: 25 },
      { driverId: '3', position: 2, points: 18 },
      { driverId: '2', position: 3, points: 15 },
      { driverId: '5', position: 4, points: 12 },
      { driverId: '4', position: 5, points: 10 },
      { driverId: '7', position: 6, points: 8 },
      { driverId: '6', position: 7, points: 6 },
      { driverId: '9', position: 8, points: 4 },
      { driverId: '8', position: 9, points: 2 },
      { driverId: '10', position: 10, points: 1 }
    ]
  },
  {
    id: 'mont2',
    name: 'Montée de Basse-Terre',
    date: '2024-04-20',
    type: 'montagne',
    results: [
      { driverId: '2', position: 1, points: 25 },
      { driverId: '1', position: 2, points: 18 },
      { driverId: '4', position: 3, points: 15 },
      { driverId: '3', position: 4, points: 12 },
      { driverId: '6', position: 5, points: 10 },
      { driverId: '5', position: 6, points: 8 },
      { driverId: '8', position: 7, points: 6 },
      { driverId: '7', position: 8, points: 4 },
      { driverId: '10', position: 9, points: 2 },
      { driverId: '9', position: 10, points: 1 }
    ]
  }
];

export const rallyeRaces: Race[] = [
  {
    id: 'rally1',
    name: 'Rallye de Grande-Terre',
    date: '2024-05-10',
    type: 'rallye',
    results: [
      { driverId: '3', position: 1, points: 25 },
      { driverId: '2', position: 2, points: 18 },
      { driverId: '1', position: 3, points: 15 },
      { driverId: '7', position: 4, points: 12 },
      { driverId: '4', position: 5, points: 10 },
      { driverId: '9', position: 6, points: 8 },
      { driverId: '5', position: 7, points: 6 },
      { driverId: '6', position: 8, points: 4 },
      { driverId: '10', position: 9, points: 2 },
      { driverId: '8', position: 10, points: 1 }
    ]
  },
  {
    id: 'rally2',
    name: 'Rallye des Îles',
    date: '2024-06-15',
    type: 'rallye',
    results: [
      { driverId: '1', position: 1, points: 25 },
      { driverId: '4', position: 2, points: 18 },
      { driverId: '3', position: 3, points: 15 },
      { driverId: '2', position: 4, points: 12 },
      { driverId: '8', position: 5, points: 10 },
      { driverId: '6', position: 6, points: 8 },
      { driverId: '7', position: 7, points: 6 },
      { driverId: '5', position: 8, points: 4 },
      { driverId: '9', position: 9, points: 2 },
      { driverId: '10', position: 10, points: 1 }
    ]
  }
];
