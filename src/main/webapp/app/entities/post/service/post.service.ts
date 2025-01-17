import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPost, NewPost } from '../post.model';

export type PartialUpdatePost = Partial<IPost> & Pick<IPost, 'id'>;

export type EntityResponseType = HttpResponse<IPost>;
export type EntityArrayResponseType = HttpResponse<IPost[]>;

@Injectable({ providedIn: 'root' })
export class PostService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/posts');

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
  ) {}

  create(post: NewPost): Observable<EntityResponseType> {
    return this.http.post<IPost>(this.resourceUrl, post, { observe: 'response' });
  }

  update(post: IPost): Observable<EntityResponseType> {
    return this.http.put<IPost>(`${this.resourceUrl}/${this.getPostIdentifier(post)}`, post, { observe: 'response' });
  }

  partialUpdate(post: PartialUpdatePost): Observable<EntityResponseType> {
    return this.http.patch<IPost>(`${this.resourceUrl}/${this.getPostIdentifier(post)}`, post, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IPost>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  findAll(limit?: number): Observable<EntityArrayResponseType> {
    if(limit) {
      return this.http.get<IPost[]>(`${this.resourceUrl}/all?limit=${limit}`, { observe: 'response' });
    }
    return this.http.get<IPost[]>(`${this.resourceUrl}/all`, { observe: 'response' });
  }

  findAllByAuthorId(id: number, limit?: number): Observable<EntityArrayResponseType> {
    if(limit) {
      return this.http.get<IPost[]>(`${this.resourceUrl}/author/${id}?limit=${limit}`, { observe: 'response' });
    }
    return this.http.get<IPost[]>(`${this.resourceUrl}/author/${id}`, { observe: 'response' });
  }

  likePost(id: number): Observable<EntityResponseType> {
    return this.http.post<IPost>(`${this.resourceUrl}/${id}/like`, null, { observe: 'response' });
  }

  unlikePost(id: number): Observable<EntityResponseType> {
    return this.http.post<IPost>(`${this.resourceUrl}/${id}/unlike`, null, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPost[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPostIdentifier(post: Pick<IPost, 'id'>): number {
    return post.id;
  }

  comparePost(o1: Pick<IPost, 'id'> | null, o2: Pick<IPost, 'id'> | null): boolean {
    return o1 && o2 ? this.getPostIdentifier(o1) === this.getPostIdentifier(o2) : o1 === o2;
  }

  addPostToCollectionIfMissing<Type extends Pick<IPost, 'id'>>(
    postCollection: Type[],
    ...postsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const posts: Type[] = postsToCheck.filter(isPresent);
    if (posts.length > 0) {
      const postCollectionIdentifiers = postCollection.map(postItem => this.getPostIdentifier(postItem)!);
      const postsToAdd = posts.filter(postItem => {
        const postIdentifier = this.getPostIdentifier(postItem);
        if (postCollectionIdentifiers.includes(postIdentifier)) {
          return false;
        }
        postCollectionIdentifiers.push(postIdentifier);
        return true;
      });
      return [...postsToAdd, ...postCollection];
    }
    return postCollection;
  }
}
