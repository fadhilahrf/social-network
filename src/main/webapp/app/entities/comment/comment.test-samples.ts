import { IComment, NewComment } from './comment.model';

export const sampleWithRequiredData: IComment = {
  id: 7856,
  content: 'unbearably',
};

export const sampleWithPartialData: IComment = {
  id: 3307,
  content: 'whose till pfft',
  likeCount: 32641,
};

export const sampleWithFullData: IComment = {
  id: 5840,
  content: 'ick comprise uh-huh',
  likeCount: 14768,
};

export const sampleWithNewData: NewComment = {
  content: 'as smoggy bland',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
