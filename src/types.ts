export type Language = 'uz' | 'ru' | 'en';
export type AgeGroup = 'kids' | 'teens' | 'adults';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  data: string; // base64 without prefix
  size: number;
  previewUrl?: string;
  textSnippet?: string;
}

export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  style?: string;
}

export interface SearchImageItem {
  id?: string;
  url: string;
  thumbUrl?: string;
  title?: string;
  author?: string;
  authorUrl?: string;
  source?: string;
  sourceUrl?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachments?: Attachment[];
  generatedImage?: GeneratedImage;
  searchedImages?: SearchImageItem[];
  searchQuery?: string;
  isGenerating?: boolean;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  ageGroup: AgeGroup;
}

export interface UserProfile {
  name: string;
  age: number;
  ageGroup: AgeGroup;
  language: Language;
  onboarded: boolean;
}

