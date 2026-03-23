import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { IDBPDatabase } from 'idb';
import { FolioDBSchema, initDB } from './index';

interface DBContextType {
  db: IDBPDatabase<FolioDBSchema> | null;
  initialized: boolean;
  error: Error | null;
}

const DBContext = createContext<DBContextType>({
  db: null,
  initialized: false,
  error: null,
});

export function DBProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<IDBPDatabase<FolioDBSchema> | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const database = await initDB();
        setDb(database);
        setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize database'));
      }
    }
    init();
  }, []);

  return (
    <DBContext.Provider value={{ db, initialized, error }}>
      {children}
    </DBContext.Provider>
  );
}

export function useDB() {
  const context = useContext(DBContext);
  if (!context) {
    throw new Error('useDB must be used within a DBProvider');
  }
  return context;
}
