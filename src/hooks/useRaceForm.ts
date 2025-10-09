
import { useState } from 'react';
import { Race } from '@/types/championship';

interface RaceFormData {
  name: string;
  date: string;
  endDate: string;
  organizer?: string;
  type: 'montagne' | 'rallye' | 'karting' | 'acceleration';
}

export const useRaceForm = () => {
  const [formData, setFormData] = useState<RaceFormData>({
    name: '',
    date: '',
    endDate: '',
    organizer: '',
    type: 'montagne'
  });

  const updateFormData = (updates: Partial<RaceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({ name: '', date: '', endDate: '', organizer: '', type: 'montagne' });
  };

  const loadRaceData = (race: Race) => {
    setFormData({
      name: race.name,
      date: race.date,
      endDate: race.endDate || '',
      organizer: race.organizer || '',
      type: race.type
    });
  };

  const isFormValid = () => {
    return formData.name.trim() !== '' && formData.date.trim() !== '';
  };

  return {
    formData,
    updateFormData,
    resetForm,
    loadRaceData,
    isFormValid
  };
};
