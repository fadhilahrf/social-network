import { IUser } from 'app/entities/user/user.model';
import { NotificationType } from 'app/entities/enumerations/notification-type.model';
import dayjs from 'dayjs';

export interface INotification {
  id: number;
  type?: keyof typeof NotificationType | null;
  destination?: string | null;
  message?: string | null;
  isRead?: boolean | null;
  sender?: Pick<IUser, 'id' | 'login'> | null;
  receiver?: Pick<IUser, 'id' | 'login'> | null;
  createdDate?: dayjs.Dayjs | null;
}

export type NewNotification = Omit<INotification, 'id'> & { id: null };
