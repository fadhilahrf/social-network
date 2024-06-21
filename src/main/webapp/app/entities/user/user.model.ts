export interface IUser {
  id: number;
  login?: string;
  firstName?: string;
  lastName?: string;
  followerCount?: number;
  followingCount?: number;
  isFollowed?: boolean;
}

export class User implements IUser {
  constructor(
    public id: number,
    public login: string,
    public firstName: string,
    public lastName: string,
    public followerCount: number,
    public followingCount: number,
    public isFollowed: boolean,
  ) {}
}

export function getUserIdentifier(user: IUser): number {
  return user.id;
}
