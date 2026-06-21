import api from './api';

export interface Presentation {
  id: string;
  title: string;
  type: string;
  audience?: string;
  style?: string;
  language?: string;
  status: 'draft' | 'parsed' | 'outline_generated' | 'completed' | 'generating' | 'error';
  slides_count: number;
  presentation_json?: Record<string, unknown>;
  source_file_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface PresentationCreate {
  title: string;
  type: string;
  audience: string;
  style: string;
  language: string;
  slides_count: number;
}

export interface FileUploadResponse {
  id: string;
  original_name: string;
  mime_type: string;
  size: number;
  status: string;
  extracted_text?: string;
  sheet_info?: string;
  created_at: string;
}

export interface TaskStatus {
  id: string;
  presentation_id: string;
  task_type: string;
  status: string;
  progress: number;
  error_message?: string;
}

export interface OutlineResponse {
  presentation_json: Record<string, unknown>;
}

export interface ExportResponse {
  id: string;
  format: string;
  status: string;
  file_path?: string;
  created_at: string;
}

// Презентации
export async function getPresentations(): Promise<Presentation[]> {
  const { data } = await api.get('/presentations');
  return data;
}

export async function getPresentation(id: string): Promise<Presentation> {
  const { data } = await api.get(`/presentations/${id}`);
  return data;
}

export async function createPresentation(params: PresentationCreate): Promise<Presentation> {
  const { data } = await api.post('/presentations', params);
  return data;
}

export async function updatePresentation(id: string, updates: Partial<Presentation>): Promise<Presentation> {
  const { data } = await api.patch(`/presentations/${id}`, updates);
  return data;
}

export async function deletePresentation(id: string): Promise<void> {
  await api.delete(`/presentations/${id}`);
}

// Файлы
export async function uploadFile(file: File, onProgress?: (pct: number) => void): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return data;
}

export async function createPresentationFromFile(
  fileId: string,
  params: PresentationCreate
): Promise<Presentation> {
  const { data } = await api.post('/presentations', {
    ...params,
    source_file_id: fileId,
  });
  return data;
}

// Генерация
export async function generateOutline(id: string): Promise<TaskStatus> {
  const { data } = await api.post(`/presentations/${id}/generate-outline`);
  return data;
}

export async function generateSlides(id: string): Promise<TaskStatus> {
  const { data } = await api.post(`/presentations/${id}/generate-slides`);
  return data;
}

export async function regenerateSlide(id: string, slideIndex: number): Promise<Presentation> {
  const { data } = await api.post(`/presentations/${id}/regenerate-slide/${slideIndex}`);
  return data;
}

export async function getTaskStatus(taskId: string): Promise<TaskStatus> {
  const { data } = await api.get(`/tasks/${taskId}`);
  return data;
}

// Экспорт
export async function exportPresentation(id: string, format: 'pptx' | 'pdf'): Promise<ExportResponse> {
  const { data } = await api.post(`/exports/${id}/${format}`);
  return data;
}

export function getDownloadUrl(exportId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  return `${base}/exports/${exportId}/download`;
}
