import { QueryClient } from '@tanstack/react-query';
import { get, set, del } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

// Create the standard React Query client
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 Days garbage collection
            staleTime: 1000 * 60 * 5, // 5 minutes before considering dirty
            retry: 3, // Retry failed network requests
            refetchOnWindowFocus: true, // Auto-background sync on active tab
            refetchOnMount: true, // Sync on page load initially
            networkMode: 'offlineFirst', // Let queries return cached data instantly
        },
        mutations: {
            networkMode: 'offlineFirst', // Queue mutations when offline
        }
    },
});

// Create an IndexedDB based persister
export function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
    return {
        persistClient: async (client: PersistedClient) => {
            await set(idbValidKey, client);
        },
        restoreClient: async () => {
            return await get<PersistedClient>(idbValidKey);
        },
        removeClient: async () => {
            await del(idbValidKey);
        },
    } as Persister;
}

export const indexedDBPersister = createIDBPersister();
