export interface Message {
  id: string;
  incidenciaId: string;
  senderId: string;
  senderType: 'EMPLOYEE' | 'CLIENT' | 'SYSTEM';
  messageType: 'TEXT' | 'IMAGE_REQUEST' | 'SYSTEM';
  content: string;
  attachments?: string[] | null;
  metadata?: {
    requestType?: 'RE_UPLOAD_IMAGES';
    allowedUntil?: string;
    imageUploadEnabled?: boolean;
  } | null;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    lastName: string;
    email: string;
  };
}

export interface MessagesResponse {
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
  oldestMessageId: string;
  newestMessageId: string;
}

export interface CreateMessageDto {
  content: string;
  attachments?: string[];
}

export interface UploadImageResponse {
  urls: string[];
}
