import { IUser } from 'app/entities/user/user.model';
import { IPost } from 'app/entities/post/post.model';
import dayjs from 'dayjs';

export interface IComment {
  id: number;
  content?: string | null;
  likeCount?: number | null;
  author?: Pick<IUser, 'id' | 'login'> | null;
  likes?: Pick<IUser, 'id' | 'login'>[] | null;
  likedByMe?: boolean;
  post?: Pick<IPost, 'id'> | null;
  createdDate?: dayjs.Dayjs| null;
}

export type NewComment = Omit<IComment, 'id'> & { id: null };
