import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { Pagination } from 'app/core/request/request.model';
import { IUser, getUserIdentifier } from '../user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private resourceUrl = this.applicationConfigService.getEndpointFor('api/users');
  private publicResourceUrl = this.applicationConfigService.getEndpointFor('api/public');

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {}

  query(req?: Pagination): Observable<HttpResponse<IUser[]>> {
    const options = createRequestOption(req);
    return this.http.get<IUser[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  compareUser(o1: Pick<IUser, 'id'> | null, o2: Pick<IUser, 'id'> | null): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  getAll(search?: string): Observable<HttpResponse<IUser[]>> {
    return this.http.get<IUser[]>(`${this.publicResourceUrl}/users/all${search? '?search='+search:''}`, { observe: 'response' });
  }

  findPublicUserByLogin(login: string): Observable<HttpResponse<IUser>> {
    return this.http.get<IUser>(`${this.publicResourceUrl}/users/${login}`, { observe: 'response' });
  }

  follow(login: string): Observable<HttpResponse<void>> { 
    return this.http.post<void>(`${this.publicResourceUrl}/user/follow/${login}`, {},{ observe: 'response' });
  }

  unfollow(login: string): Observable<HttpResponse<void>> { 
    return this.http.post<void>(`${this.publicResourceUrl}/user/unfollow/${login}`, {}, { observe: 'response' });
  }

  getFollowersByUserLogin(login: string): Observable<HttpResponse<IUser[]>> {
    return this.http.get<IUser[]>(`${this.publicResourceUrl}/users/followers/${login}`, { observe: 'response' });
  }

  getFollowingByUserLogin(login: string): Observable<HttpResponse<IUser[]>> {
    return this.http.get<IUser[]>(`${this.publicResourceUrl}/users/following/${login}`, { observe: 'response' });
  }

  addUserToCollectionIfMissing<Type extends Partial<IUser> & Pick<IUser, 'id'>>(
    userCollection: Type[],
    ...usersToCheck: (Type | null | undefined)[]
  ): IUser[] {
    const users: Type[] = usersToCheck.filter(isPresent);
    if (users.length > 0) {
      const userCollectionIdentifiers = userCollection.map(userItem => getUserIdentifier(userItem)!);
      const usersToAdd = users.filter(userItem => {
        const userIdentifier = getUserIdentifier(userItem);
        if (userCollectionIdentifiers.includes(userIdentifier)) {
          return false;
        }
        userCollectionIdentifiers.push(userIdentifier);
        return true;
      });
      return [...usersToAdd, ...userCollection];
    }
    return userCollection;
  }
}
