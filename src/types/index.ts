export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'table'
  | 'list'
  | 'callout'
  | 'code'
  | 'divider'
  | 'columns'
  | 'pagebreak'
  | 'cover'
  | 'html';

export interface BlockStyle {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  border?: string;
  fontSize?: string;
  color?: string;
  tailwindClasses?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: string;
  borderRadius?: string;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
  boxShadow?: string;
  width?: string;
  height?: string;
  maxWidth?: string;
  minHeight?: string;
  display?: string;
  flexDirection?: string;
  gap?: string;
  opacity?: string;
  overflow?: string;
  className?: string;
}

export interface HeadingProps {
  level: 1 | 2 | 3 | 4;
  text: string;
}

export interface ParagraphProps {
  text: string;
  html?: string;
}

export interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: string;
  height?: string;
  assetId?: string;
}

export interface TableProps {
  rows: string[][];
  headerRows: number;
  mergedCells?: CellMerge[];
}

export interface CellMerge {
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

export interface ListProps {
  type: 'ordered' | 'unordered';
  items: ListItem[];
}

export interface ListItem {
  id: string;
  text: string;
  children?: ListItem[];
}

export interface CalloutProps {
  text: string;
  variant: 'info' | 'warning' | 'error' | 'success';
  color?: string;
}

export interface CodeProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export interface DividerProps {
  style: 'line' | 'dots' | 'double';
  color?: string;
}

export interface ColumnsProps {
  count: number;
  ratios?: number[];
}

export interface PageBreakProps {}

export interface CoverProps {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  backgroundImage?: string;
}

export interface HtmlProps {
  html: string;
}

export type BlockProps =
  | HeadingProps
  | ParagraphProps
  | ImageProps
  | TableProps
  | ListProps
  | CalloutProps
  | CodeProps
  | DividerProps
  | ColumnsProps
  | PageBreakProps
  | CoverProps
  | HtmlProps;

export interface Block {
  id: string;
  type: BlockType;
  isSlot: boolean;
  slotHint: string | null;
  props: BlockProps;
  style: BlockStyle;
  children: Block[] | null;
}

export interface DocumentSettings {
  fontFamily: string;
  baseFontSize: number;
  colorPalette: Record<string, string>;
  pageWidth: string;
  headerContent?: string;
  footerContent?: string;
  pageNumbers: boolean;
  pageNumberPosition: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  pageBackground?: string;
  pagePadding?: string;
  pageBorderRadius?: string;
  pageShadow?: string;
  customCss?: string;
}

export interface Document {
  id: string;
  title: string;
  mode: 'nocode' | 'code';
  blocks: Block[];
  htmlSource: string;
  cssSource: string;
  headSource: string;
  templateId: string | null;
  settings: DocumentSettings;
  createdAt: number;
  updatedAt: number;
  thumbnail: string | null;
  tags: string[];
}

export type TemplateCategory = 'business' | 'academic' | 'legal' | 'creative' | 'personal' | 'technical';

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  description: string;
  thumbnail: string | null;
  blocks: Block[];
  cssSource: string;
  headSource: string;
  isBuiltIn: boolean;
  source: 'builtin' | 'user' | 'community';
  version: string;
  createdAt: number;
}

export interface Asset {
  id: string;
  documentId: string;
  filename: string;
  mimeType: string;
  data: ArrayBuffer;
  sizeBytes: number;
  createdAt: number;
}

export type SettingsKey =
  | 'app.theme'
  | 'app.defaultMode'
  | 'app.autoSaveInterval'
  | 'export.defaultPageSize'
  | 'export.defaultOrientation'
  | 'community.enableFetch'
  | 'storage.usageBytes';

export type SettingsValue = string | number | boolean;

export interface Settings {
  key: SettingsKey;
  value: SettingsValue;
}

export type PreviewMode = 'web' | 'page' | 'print';
export type PageSize = 'A3' | 'A4' | 'A5' | 'Letter' | 'Legal' | 'Tabloid' | 'Custom';
export type ExportFormat = 'html' | 'pdf' | 'markdown' | 'json' | 'folio';
export type EditorMode = 'nocode' | 'code';
export type Theme = 'light' | 'dark' | 'system';

export interface SlashMenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
}

export interface CommandPaletteItem {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'block' | 'document' | 'export' | 'settings';
}

export const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  { type: 'heading', label: 'Heading', description: 'Section heading (H1–H4)', icon: 'heading' },
  { type: 'paragraph', label: 'Paragraph', description: 'Plain text block', icon: 'type' },
  { type: 'image', label: 'Image', description: 'Upload or URL image', icon: 'image' },
  { type: 'table', label: 'Table', description: 'Rows and columns', icon: 'table' },
  { type: 'list', label: 'List', description: 'Ordered or unordered list', icon: 'list' },
  { type: 'callout', label: 'Callout', description: 'Info, warning, or error box', icon: 'alert-circle' },
  { type: 'code', label: 'Code Block', description: 'Syntax-highlighted code', icon: 'code' },
  { type: 'divider', label: 'Divider', description: 'Horizontal separator', icon: 'minus' },
  { type: 'columns', label: 'Columns', description: '2 or 3 column layout', icon: 'columns' },
  { type: 'pagebreak', label: 'Page Break', description: 'Forced page break for PDF', icon: 'scissors' },
  { type: 'cover', label: 'Cover', description: 'Full-height cover page', icon: 'book-open' },
  { type: 'html', label: 'Custom HTML', description: 'Raw HTML block', icon: 'file-code' },
];

export const PAGE_SIZES: Record<PageSize, { width: string; height: string }> = {
  A3: { width: '297mm', height: '420mm' },
  A4: { width: '210mm', height: '297mm' },
  A5: { width: '148mm', height: '210mm' },
  Letter: { width: '8.5in', height: '11in' },
  Legal: { width: '8.5in', height: '14in' },
  Tabloid: { width: '11in', height: '17in' },
  Custom: { width: '210mm', height: '297mm' },
};
