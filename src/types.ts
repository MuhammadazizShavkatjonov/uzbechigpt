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

export interface GeneratedVideo {
  videoUrl?: string;
  prompt: string;
  duration?: number;
  quality?: string;
  status: 'generating' | 'completed' | 'failed';
  operationName?: string;
  progressStage?: string;
  error?: string;
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
  generatedVideo?: GeneratedVideo;
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

export interface VideoSettings {
  duration: number; // 5, 8, 10, 15, 20, 30
  quality: 'Standard' | 'High' | 'Ultra';
  resolution: '480p' | '720p' | '1080p' | '2K' | '4K';
  aspectRatio: '16:9' | '9:16' | '1:1';
  style: 'Realistic' | 'Cinematic' | '3D' | 'Animation';
  camera: 'Static' | 'Zoom In' | 'Zoom Out' | 'Tracking Shot' | 'Drone Shot';
  pollinationsApiKey?: string;
}
