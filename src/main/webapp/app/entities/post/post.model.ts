import { IUser } from 'app/entities/user/user.model';
import dayjs from 'dayjs';

export interface IPost {
  id: number;
  author?: Pick<IUser, 'id' | 'login'> | null;
  content?: string | null;
  likeCount?: number | null;
  commentCount?: number | null;
  likes?: Pick<IUser, 'id' | 'login'>[] | null;
  likedByMe?: boolean;
  createdDate?: dayjs.Dayjs| null;
}

export type NewPost = Omit<IPost, 'id'> & { id: null };
