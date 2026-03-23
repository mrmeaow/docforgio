import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Document, Template, Asset, Settings } from '../types';

// IndexedDB schema definition
export interface FolioDBSchema extends DBSchema {
  documents: {
    key: string;
    value: Document;
    indexes: {
      title: string;
      templateId: string;
      createdAt: number;
      updatedAt: number;
    };
  };
  templates: {
    key: string;
    value: Template;
    indexes: {
      name: string;
      slug: string;
      category: string;
      isBuiltIn: string; // Use string instead of boolean for idb compatibility
      source: string;
    };
  };
  assets: {
    key: string;
    value: Asset;
    indexes: {
      documentId: string;
    };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

const DB_NAME = 'folio-db';
const DB_VERSION = 1;

// Initialize the database
export async function initDB(): Promise<IDBPDatabase<FolioDBSchema>> {
  return openDB<FolioDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Documents store
      if (!db.objectStoreNames.contains('documents')) {
        const documentStore = db.createObjectStore('documents', {
          keyPath: 'id',
        });
        documentStore.createIndex('title', 'title');
        documentStore.createIndex('templateId', 'templateId');
        documentStore.createIndex('createdAt', 'createdAt');
        documentStore.createIndex('updatedAt', 'updatedAt');
      }

      // Templates store
      if (!db.objectStoreNames.contains('templates')) {
        const templateStore = db.createObjectStore('templates', {
          keyPath: 'id',
        });
        templateStore.createIndex('name', 'name');
        templateStore.createIndex('slug', 'slug', { unique: true });
        templateStore.createIndex('category', 'category');
        templateStore.createIndex('isBuiltIn', 'isBuiltIn');
        templateStore.createIndex('source', 'source');
      }

      // Assets store
      if (!db.objectStoreNames.contains('assets')) {
        const assetsStore = db.createObjectStore('assets', {
          keyPath: 'id',
        });
        assetsStore.createIndex('documentId', 'documentId');
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', {
          keyPath: 'key',
        });
      }
    },
  });
}

// Document operations
export async function getDocument(db: IDBPDatabase<FolioDBSchema>, id: string): Promise<Document | undefined> {
  return db.get('documents', id);
}

export async function getAllDocuments(db: IDBPDatabase<FolioDBSchema>): Promise<Document[]> {
  return db.getAll('documents');
}

export async function saveDocument(db: IDBPDatabase<FolioDBSchema>, doc: Document): Promise<void> {
  doc.updatedAt = Date.now();
  await db.put('documents', doc);
}

export async function deleteDocument(db: IDBPDatabase<FolioDBSchema>, id: string): Promise<void> {
  await db.delete('documents', id);
  // Also delete associated assets
  const assets = await db.getAllFromIndex('assets', 'documentId', id);
  for (const asset of assets) {
    await db.delete('assets', asset.id);
  }
}

export async function getDocumentsByTemplate(
  db: IDBPDatabase<FolioDBSchema>,
  templateId: string
): Promise<Document[]> {
  return db.getAllFromIndex('documents', 'templateId', templateId);
}

// Template operations
export async function getTemplate(db: IDBPDatabase<FolioDBSchema>, id: string): Promise<Template | undefined> {
  return db.get('templates', id);
}

export async function getTemplateBySlug(db: IDBPDatabase<FolioDBSchema>, slug: string): Promise<Template | undefined> {
  return db.getFromIndex('templates', 'slug', slug);
}

export async function getAllTemplates(db: IDBPDatabase<FolioDBSchema>): Promise<Template[]> {
  return db.getAll('templates');
}

export async function getTemplatesByCategory(
  db: IDBPDatabase<FolioDBSchema>,
  category: string
): Promise<Template[]> {
  return db.getAllFromIndex('templates', 'category', category);
}

export async function saveTemplate(db: IDBPDatabase<FolioDBSchema>, template: Template): Promise<void> {
  await db.put('templates', template);
}

export async function deleteTemplate(db: IDBPDatabase<FolioDBSchema>, id: string): Promise<void> {
  const template = await db.get('templates', id);
  if (template && !template.isBuiltIn) {
    await db.delete('templates', id);
  }
}

export async function getBuiltInTemplates(db: IDBPDatabase<FolioDBSchema>): Promise<Template[]> {
  return db.getAllFromIndex('templates', 'isBuiltIn', 'true');
}

export async function getUserTemplates(db: IDBPDatabase<FolioDBSchema>): Promise<Template[]> {
  return db.getAllFromIndex('templates', 'source', 'user');
}

export async function getCommunityTemplates(db: IDBPDatabase<FolioDBSchema>): Promise<Template[]> {
  return db.getAllFromIndex('templates', 'source', 'community');
}

// Asset operations
export async function getAsset(db: IDBPDatabase<FolioDBSchema>, id: string): Promise<Asset | undefined> {
  return db.get('assets', id);
}

export async function getAssetsByDocument(
  db: IDBPDatabase<FolioDBSchema>,
  documentId: string
): Promise<Asset[]> {
  return db.getAllFromIndex('assets', 'documentId', documentId);
}

export async function saveAsset(db: IDBPDatabase<FolioDBSchema>, asset: Asset): Promise<void> {
  await db.put('assets', asset);
}

export async function deleteAsset(db: IDBPDatabase<FolioDBSchema>, id: string): Promise<void> {
  await db.delete('assets', id);
}

// Settings operations
export async function getSetting(
  db: IDBPDatabase<FolioDBSchema>,
  key: string
): Promise<Settings | undefined> {
  return db.get('settings', key);
}

export async function getAllSettings(db: IDBPDatabase<FolioDBSchema>): Promise<Settings[]> {
  return db.getAll('settings');
}

export async function saveSetting(db: IDBPDatabase<FolioDBSchema>, setting: Settings): Promise<void> {
  await db.put('settings', setting);
}

export async function getSettingValue(
  db: IDBPDatabase<FolioDBSchema>,
  key: string
): Promise<string | number | boolean | undefined> {
  const setting = await db.get('settings', key);
  return setting?.value;
}

export async function setSettingValue(
  db: IDBPDatabase<FolioDBSchema>,
  key: string,
  value: string | number | boolean
): Promise<void> {
  await db.put('settings', { key, value } as Settings);
}

// Storage quota utilities
export async function getStorageUsage(db: IDBPDatabase<FolioDBSchema>): Promise<number> {
  const assets = await db.getAll('assets');
  return assets.reduce((total, asset) => total + asset.sizeBytes, 0);
}

export async function getStorageQuotaInfo(): Promise<{ usage: number; quota: number; percentUsed: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    return {
      usage,
      quota,
      percentUsed: quota > 0 ? (usage / quota) * 100 : 0,
    };
  }
  return { usage: 0, quota: 0, percentUsed: 0 };
}
