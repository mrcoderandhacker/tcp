// src/types/index.ts
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar?: string;
  };
  access_token?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursorPosition: number;
  active: boolean;
}

export interface DocumentData {
  content: string;
  meeting_id: string;
  last_modified?: string;
  last_modified_by?: string;
  last_modified_by_name?: string;
}