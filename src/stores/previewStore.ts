import { create } from 'zustand';
import type { PreviewMode, PageSize } from '../types';

interface PreviewState {
  previewMode: PreviewMode;
  zoom: number;
  pageSize: PageSize;
  customPageSize: { width: string; height: string } | null;
  orientation: 'portrait' | 'landscape';
  showRulers: boolean;
  viewportWidth: number | null;

  setPreviewMode: (mode: PreviewMode) => void;
  setZoom: (zoom: number) => void;
  setPageSize: (size: PageSize, custom?: { width: string; height: string }) => void;
  setOrientation: (orientation: 'portrait' | 'landscape') => void;
  toggleRulers: () => void;
  setViewportWidth: (width: number | null) => void;
}

export const usePreviewStore = create<PreviewState>()((set) => ({
  previewMode: 'web',
  zoom: 100,
  pageSize: 'A4',
  customPageSize: null,
  orientation: 'portrait',
  showRulers: false,
  viewportWidth: null,

  setPreviewMode: (mode) => set({ previewMode: mode }),
  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
  setPageSize: (size, custom) => set({ pageSize: size, customPageSize: custom || null }),
  setOrientation: (orientation) => set({ orientation }),
  toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),
  setViewportWidth: (width) => set({ viewportWidth: width }),
}));
