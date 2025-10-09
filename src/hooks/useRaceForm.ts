
import { useState } from 'react';
import { Race } from '@/types/championship';

interface RaceFormData {
  name: string;
  date: string;
  endDate: string;
  type: 'montagne' | 'rallye';
}

export const useRaceForm = () => {
  const [formData, setFormData] = useState<RaceFormData>({
    name: '',
    date: '',
    endDate: '',
    type: 'montagne'
  });

  const updateFormData = (updates: Partial<RaceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({ name: '', date: '', endDate: '', type: 'montagne' });
  };

  const loadRaceData = (race: Race) => {
    setFormData({
      name: race.name,
      date: race.date,
      endDate: race.endDate || '',
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
