import { Topic, Message, MessageVote, User } from "@prisma/client";

// Topic with related data for list view
export type TopicWithDetails = Topic & {
  author: Pick<User, "username">;
  _count: {
    messages: number;
  };
};

// Message with related data for display
export type MessageWithDetails = Message & {
  author: Pick<User, "username">;
  _count: {
    votes: number;
  };
  votes: MessageVote[]; // Current user's vote if any
};

// Form data types
export interface CreateTopicFormData {
  title: string;
  content: string;
}

export interface CreateMessageFormData {
  topicId: string;
  content: string;
}

// Action response type
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// User search result
export interface UserSearchResult {
  id: string;
  username: string;
}
