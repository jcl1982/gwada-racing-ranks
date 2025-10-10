
import { useToast } from '@/hooks/use-toast';
import { createDriverCrudOperations } from './driverCrud';
import { createDriverDeletionOperations } from './driverDeletion';
import { createDriverBulkOperations } from './driverBulkOperations';

export const createDriverOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>, championshipId?: string) => {
  const { saveDriver } = createDriverCrudOperations(toast, loadData, championshipId);
  const { deleteDriver } = createDriverDeletionOperations(toast, loadData);
  const { deleteAllDrivers } = createDriverBulkOperations(toast, loadData);

  return { saveDriver, deleteDriver, deleteAllDrivers };
};
