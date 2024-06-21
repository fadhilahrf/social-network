import { INotification, NewNotification } from './notification.model';

export const sampleWithRequiredData: INotification = {
  id: 4095,
};

export const sampleWithPartialData: INotification = {
  id: 26813,
  type: 'POST_COMMENT',
};

export const sampleWithFullData: INotification = {
  id: 10701,
  type: 'USER_FOLLOWED',
  destination: 'gator yum',
  message: 'once uselessly passionate',
  isRead: true,
};

export const sampleWithNewData: NewNotification = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
