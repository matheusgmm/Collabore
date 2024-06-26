export interface Post {
    id: number;
    user_id: number;
    image_id: number;
    tags_id: number;
    title: string;
    latitude: number;
    longitude: number;
    city: string;
    text: string;
    created_at: string;
    name: string;
    pfp: any;
    link_pfp: string;
    image: string;
    comments: Comments;
    reactions: Reactions;
    like: boolean;
    tags: string;
  }
  
  export interface Comments {
    quantidadeComentarios: number;
    commentsData: any[];
  }
  
  export interface Reactions {
    quantidadeLike: number;
    reactionsData: any[];
  }
  
  export interface Comment {
    created_at: Date;
    id: number;
    name: string;
    pfp: number;
    text: string;
  }

  export interface CommentData extends Comment {
    user_id: number;
    post_id: number;
    comments: {
      commentsData: Comment[],
      quantidadeComentarios: number
    }
  }

  export interface NewPost {
    tags: string;
    title: string;
    latitude: string | number;
    longitude: string | number;
    text: string;
    image: File | Blob | string;
  }

  export interface NewComment {
    user_id: number;
    post_id: number;
    text: string;
  }