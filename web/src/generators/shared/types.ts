export type GeneratedBook = {
  title: string;
  author?: string;
  year?: number;
  description?: string;
  summary: string;
  coverUrl?: string;
};

export type GeneratedAuthorProject = {
  author: {
    name: string;
    bio: string;
  };

  books: GeneratedBook[];
};