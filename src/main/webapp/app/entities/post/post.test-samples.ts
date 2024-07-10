import { IPost, NewPost } from './post.model';

export const sampleWithRequiredData: IPost = {
  id: 32547,
  content: 'damage excluding couch',
};

export const sampleWithPartialData: IPost = {
  id: 23916,
  content: 'so but excepting',
  likeCount: 2922,
  commentCount: 25720,
};

export const sampleWithFullData: IPost = {
  id: 17396,
  content: 'zowie grandiose within',
  likeCount: 7088,
  commentCount: 14133,
};

export const sampleWithNewData: NewPost = {
  content: 'ouch fooey',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
