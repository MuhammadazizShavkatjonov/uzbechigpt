import { Attachment } from '../types';

export function fileToBase64(file: File): Promise<{ base64Data: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1] || '';
      resolve({ base64Data, dataUrl: result });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function processUploadedFile(file: File): Promise<Attachment> {
  const { base64Data, dataUrl } = await fileToBase64(file);
  let type: 'image' | 'video' | 'document' = 'document';

  if (file.type.startsWith('image/')) {
    type = 'image';
  } else if (file.type.startsWith('video/')) {
    type = 'video';
  }

  let textSnippet: string | undefined;
  if (
    file.type.includes('text') ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.md') ||
    file.name.endsWith('.json') ||
    file.name.endsWith('.js') ||
    file.name.endsWith('.ts') ||
    file.name.endsWith('.py') ||
    file.name.endsWith('.html') ||
    file.name.endsWith('.css')
  ) {
    try {
      const text = await file.text();
      textSnippet = text.slice(0, 10000);
    } catch {
      // ignore
    }
  }

  return {
    id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: file.name,
    type,
    mimeType: file.type || 'application/octet-stream',
    data: base64Data,
    size: file.size,
    previewUrl: type === 'image' || type === 'video' ? dataUrl : undefined,
    textSnippet,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
