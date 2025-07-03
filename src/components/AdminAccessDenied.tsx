
import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const AdminAccessDenied = () => {
  return (
    <Card className="card-glass p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <Shield className="h-12 w-12 text-red-400" />
        <h3 className="text-lg font-semibold text-gray-700">Accès administrateur requis</h3>
        <p className="text-gray-600 max-w-md">
          Cette section est réservée aux administrateurs. Veuillez contacter un administrateur 
          si vous pensez que vous devriez avoir accès à cette fonctionnalité.
        </p>
      </div>
    </Card>
  );
};

export default AdminAccessDenied;
