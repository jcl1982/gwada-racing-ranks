
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileSpreadsheet, UserPlus } from 'lucide-react';
import VmrsImport from '@/components/VmrsImport';
import VmrsManualEntry from '@/components/VmrsManualEntry';

const VmrsTab = () => {
  return (
    <Tabs defaultValue="import" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="import" className="flex items-center gap-2">
          <FileSpreadsheet size={16} />
          Import Excel
        </TabsTrigger>
        <TabsTrigger value="manual" className="flex items-center gap-2">
          <UserPlus size={16} />
          Saisie manuelle
        </TabsTrigger>
      </TabsList>

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
