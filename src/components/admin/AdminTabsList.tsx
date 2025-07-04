
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, BarChart3, Edit, Settings } from 'lucide-react';

const AdminTabsList = () => {
  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="drivers" className="flex items-center gap-2">
        <Users size={16} />
        Pilotes
      </TabsTrigger>
      <TabsTrigger value="races" className="flex items-center gap-2">
        <Trophy size={16} />
        Courses
      </TabsTrigger>
      <TabsTrigger value="points" className="flex items-center gap-2">
        <Edit size={16} />
        Points
      </TabsTrigger>
      <TabsTrigger value="stats" className="flex items-center gap-2">
        <BarChart3 size={16} />
        Statistiques
      </TabsTrigger>
      <TabsTrigger value="settings" className="flex items-center gap-2">
        <Settings size={16} />
        Paramètres
      </TabsTrigger>
    </TabsList>
  );
};

export default AdminTabsList;
