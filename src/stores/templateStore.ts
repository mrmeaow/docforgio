import { create } from 'zustand';
import type { Template, TemplateCategory } from '../types';
import { generateId, generateSlug } from '../utils/id';

interface TemplateState {
  builtInTemplates: Template[];
  userTemplates: Template[];
  communityTemplates: Template[];
  isLoading: boolean;
  error: string | null;

  loadTemplates: () => Promise<void>;
  applyTemplate: (templateId: string) => Promise<Template | null>;
  saveAsTemplate: (name: string, category: TemplateCategory, description: string, blocks: Template['blocks'], cssSource: string, headSource: string) => Promise<Template>;
  importTemplate: (template: Template) => Promise<void>;
  exportTemplate: (templateId: string) => Promise<Blob | null>;
  deleteTemplate: (templateId: string) => Promise<void>;
  getTemplateById: (id: string) => Template | undefined;
  getTemplatesByCategory: (category: TemplateCategory) => Template[];
  seedBuiltInTemplates: () => Promise<void>;
}

export const useTemplateStore = create<TemplateState>()((set, get) => ({
  builtInTemplates: [],
  userTemplates: [],
  communityTemplates: [],
  isLoading: false,
  error: null,

  loadTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const { initDB, getAllTemplates } = await import('../db');
      const db = await initDB();
      const allTemplates = await getAllTemplates(db);

      if (allTemplates.filter(t => t.isBuiltIn).length === 0) {
        await get().seedBuiltInTemplates();
        const refreshed = await getAllTemplates(db);
        set({
          builtInTemplates: refreshed.filter(t => t.isBuiltIn),
          userTemplates: refreshed.filter(t => t.source === 'user'),
          communityTemplates: refreshed.filter(t => t.source === 'community'),
          isLoading: false,
        });
        return;
      }

      set({
        builtInTemplates: allTemplates.filter(t => t.isBuiltIn),
        userTemplates: allTemplates.filter(t => t.source === 'user'),
        communityTemplates: allTemplates.filter(t => t.source === 'community'),
        isLoading: false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load templates', isLoading: false });
    }
  },

  applyTemplate: async (templateId: string) => {
    try {
      const { initDB, getTemplate } = await import('../db');
      const db = await initDB();
      return (await getTemplate(db, templateId)) || null;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to apply template' });
      return null;
    }
  },

  saveAsTemplate: async (name, category, description, blocks, cssSource, headSource) => {
    const newTemplate: Template = {
      id: generateId(),
      name,
      slug: generateSlug(name),
      category,
      description,
      thumbnail: null,
      blocks,
      cssSource,
      headSource,
      isBuiltIn: false,
      source: 'user',
      version: '1.0.0',
      createdAt: Date.now(),
    };

    try {
      const { initDB, saveTemplate } = await import('../db');
      const db = await initDB();
      await saveTemplate(db, newTemplate);
      set((s) => ({ userTemplates: [...s.userTemplates, newTemplate] }));
      return newTemplate;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to save template' });
      throw err;
    }
  },

  importTemplate: async (template: Template) => {
    try {
      const { initDB, saveTemplate, getTemplateBySlug } = await import('../db');
      const db = await initDB();
      const existing = await getTemplateBySlug(db, template.slug);
      if (existing) template.slug = `${template.slug}-${Date.now()}`;
      template.id = generateId();
      template.source = 'user';
      template.isBuiltIn = false;
      await saveTemplate(db, template);
      set((s) => ({ userTemplates: [...s.userTemplates, template] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to import template' });
      throw err;
    }
  },

  exportTemplate: async (templateId: string) => {
    const template = get().getTemplateById(templateId);
    if (!template) return null;
    return new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  },

  deleteTemplate: async (templateId: string) => {
    const template = get().getTemplateById(templateId);
    if (!template || template.isBuiltIn) throw new Error('Cannot delete built-in templates');
    try {
      const { initDB, deleteTemplate: del } = await import('../db');
      const db = await initDB();
      await del(db, templateId);
      set((s) => ({
        userTemplates: s.userTemplates.filter(t => t.id !== templateId),
        communityTemplates: s.communityTemplates.filter(t => t.id !== templateId),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete template' });
      throw err;
    }
  },

  getTemplateById: (id: string) => {
    const { builtInTemplates, userTemplates, communityTemplates } = get();
    return [...builtInTemplates, ...userTemplates, ...communityTemplates].find(t => t.id === id);
  },

  getTemplatesByCategory: (category: TemplateCategory) => {
    const { builtInTemplates, userTemplates, communityTemplates } = get();
    return [...builtInTemplates, ...userTemplates, ...communityTemplates].filter(t => t.category === category);
  },

  seedBuiltInTemplates: async () => {
    const { initDB, saveTemplate } = await import('../db');
    const { builtinTemplates } = await import('../templates/builtin');
    const db = await initDB();
    for (const tmpl of builtinTemplates) {
      await saveTemplate(db, tmpl);
    }
  },
}));
