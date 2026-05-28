
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileSpreadsheet, UserPlus, Users } from 'lucide-react';
import VmrsImport from '@/components/VmrsImport';
import VmrsManualEntry from '@/components/VmrsManualEntry';
import VmrsDriversManagement from '@/components/VmrsDriversManagement';

const VmrsTab = () => {
  return (
    <Tabs defaultValue="drivers" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="drivers" className="flex items-center gap-2">
          <Users size={16} />
          Pilotes VMRS
        </TabsTrigger>
        <TabsTrigger value="import" className="flex items-center gap-2">
          <FileSpreadsheet size={16} />
          Import Excel
        </TabsTrigger>
        <TabsTrigger value="manual" className="flex items-center gap-2">
          <UserPlus size={16} />
          Saisie manuelle
        </TabsTrigger>
      </TabsList>

      <TabsContent value="drivers">
        <VmrsDriversManagement />
      </TabsContent>

      <TabsContent value="import">
        <VmrsImport />
      </TabsContent>

      <TabsContent value="manual">
        <VmrsManualEntry />
      </TabsContent>
    </Tabs>
  );
};

export default VmrsTab;
