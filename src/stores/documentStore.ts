import { create } from 'zustand';
import type { Document, DocumentSettings } from '../types';
import { generateId } from '../utils/id';

interface DocumentState {
  currentDocId: string | null;
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';

  loadDocuments: () => Promise<void>;
  loadDocument: (id: string) => Promise<Document | null>;
  createDocument: (title?: string, templateId?: string, blocks?: Document['blocks'], cssSource?: string, headSource?: string) => Promise<Document>;
  saveDocument: (doc: Document) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string) => Promise<Document>;
  renameDocument: (id: string, title: string) => Promise<void>;
  setCurrentDocId: (id: string | null) => void;
  getCurrentDocument: () => Document | null;
  setSaveStatus: (status: DocumentState['saveStatus']) => void;
}

const defaultSettings: DocumentSettings = {
  fontFamily: 'Inter',
  baseFontSize: 16,
  colorPalette: {},
  pageWidth: '210mm',
  pageNumbers: false,
  pageNumberPosition: 'bottom-center',
};

export const useDocumentStore = create<DocumentState>()((set, get) => ({
  currentDocId: null,
  documents: [],
  isLoading: false,
  error: null,
  saveStatus: 'idle',

  loadDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { initDB, getAllDocuments: getAll } = await import('../db');
      const db = await initDB();
      const docs = await getAll(db);
      docs.sort((a, b) => b.updatedAt - a.updatedAt);
      set({ documents: docs, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load documents', isLoading: false });
    }
  },

  loadDocument: async (id: string) => {
    try {
      const { initDB, getDocument } = await import('../db');
      const db = await initDB();
      const doc = await getDocument(db, id);
      if (doc) {
        set((state) => ({ documents: state.documents.map((d) => (d.id === id ? doc : d)) }));
      }
      return doc || null;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load document' });
      return null;
    }
  },

  createDocument: async (title = 'Untitled Document', templateId?: string, blocks?: Document['blocks'], cssSource?: string, headSource?: string) => {
    const newDoc: Document = {
      id: generateId(),
      title,
      mode: 'nocode',
      blocks: blocks || [],
      htmlSource: '',
      cssSource: cssSource || '',
      headSource: headSource || '',
      templateId: templateId || null,
      settings: defaultSettings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      thumbnail: null,
      tags: [],
    };

    try {
      const { initDB, saveDocument } = await import('../db');
      const db = await initDB();
      await saveDocument(db, newDoc);
      set((state) => ({
        documents: [newDoc, ...state.documents],
        currentDocId: newDoc.id,
      }));
      return newDoc;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create document' });
      throw err;
    }
  },

  saveDocument: async (doc: Document) => {
    try {
      const { initDB, saveDocument } = await import('../db');
      const db = await initDB();
      doc.updatedAt = Date.now();
      await saveDocument(db, doc);
      set((state) => ({
        documents: state.documents.map((d) => (d.id === doc.id ? doc : d)),
        saveStatus: 'saved',
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to save document', saveStatus: 'error' });
      throw err;
    }
  },

  deleteDocument: async (id: string) => {
    try {
      const { initDB, deleteDocument } = await import('../db');
      const db = await initDB();
      await deleteDocument(db, id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        currentDocId: state.currentDocId === id ? null : state.currentDocId,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete document' });
      throw err;
    }
  },

  duplicateDocument: async (id: string) => {
    const original = get().documents.find((d) => d.id === id);
    if (!original) throw new Error('Document not found');

    const duplicated: Document = {
      ...JSON.parse(JSON.stringify(original)),
      id: generateId(),
      title: `${original.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      const { initDB, saveDocument } = await import('../db');
      const db = await initDB();
      await saveDocument(db, duplicated);
      set((state) => ({ documents: [duplicated, ...state.documents] }));
      return duplicated;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to duplicate document' });
      throw err;
    }
  },

  renameDocument: async (id: string, title: string) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc) throw new Error('Document not found');

    const updated: Document = { ...doc, title };
    try {
      const { initDB, saveDocument } = await import('../db');
      const db = await initDB();
      await saveDocument(db, updated);
      set((state) => ({ documents: state.documents.map((d) => (d.id === id ? updated : d)) }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to rename document' });
      throw err;
    }
  },

  setCurrentDocId: (id: string | null) => set({ currentDocId: id }),

  getCurrentDocument: () => {
    const { currentDocId, documents } = get();
    return documents.find((d) => d.id === currentDocId) || null;
  },

  setSaveStatus: (status) => set({ saveStatus: status }),
}));
