
import { useCallback } from 'react';
import { executeWebPrint, executeUnicodePrint } from '@/utils/print/printOperations';

export const useWebPrint = () => {
  const printWebPage = useCallback((
    elementId?: string,
    title?: string
  ) => {
    executeWebPrint(elementId, title);
  }, []);

  const printWithUnicodeSupport = useCallback((
    elementId?: string,
    title?: string,
    customStyles?: string
  ) => {
    executeUnicodePrint(elementId, title, customStyles);
  }, []);

  return { printWebPage, printWithUnicodeSupport };
};
