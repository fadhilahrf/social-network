import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { INotification, NewNotification } from '../notification.model';

export type PartialUpdateNotification = Partial<INotification> & Pick<INotification, 'id'>;

export type EntityResponseType = HttpResponse<INotification>;
export type EntityArrayResponseType = HttpResponse<INotification[]>;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/notifications');

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
  ) {}

  create(notification: NewNotification): Observable<EntityResponseType> {
    return this.http.post<INotification>(this.resourceUrl, notification, { observe: 'response' });
  }

  update(notification: INotification): Observable<EntityResponseType> {
    return this.http.put<INotification>(`${this.resourceUrl}/${this.getNotificationIdentifier(notification)}`, notification, {
      observe: 'response',
    });
  }

  partialUpdate(notification: PartialUpdateNotification): Observable<EntityResponseType> {
    return this.http.patch<INotification>(`${this.resourceUrl}/${this.getNotificationIdentifier(notification)}`, notification, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<INotification>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<INotification[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  findAllByReceiver(login: string): Observable<EntityArrayResponseType> {
    return this.http.get<INotification[]>(`${this.resourceUrl}/receiver/${login}`, { observe: 'response' });
  }

  readAllByReceiver(login: string, limit?: number): Observable<EntityArrayResponseType> {
    if(limit) {
      return this.http.get<INotification[]>(`${this.resourceUrl}/read/${login}?limit=${limit}`, { observe: 'response' });
    }
    return this.http.get<INotification[]>(`${this.resourceUrl}/read/${login}`, { observe: 'response' });
  }

  countUnreadNotification(login: string): Observable<HttpResponse<number>> {
    return this.http.get<number>(`${this.resourceUrl}/count-unread/${login}`, { observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getNotificationIdentifier(notification: Pick<INotification, 'id'>): number {
    return notification.id;
  }

  compareNotification(o1: Pick<INotification, 'id'> | null, o2: Pick<INotification, 'id'> | null): boolean {
    return o1 && o2 ? this.getNotificationIdentifier(o1) === this.getNotificationIdentifier(o2) : o1 === o2;
  }

  addNotificationToCollectionIfMissing<Type extends Pick<INotification, 'id'>>(
    notificationCollection: Type[],
    ...notificationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const notifications: Type[] = notificationsToCheck.filter(isPresent);
    if (notifications.length > 0) {
      const notificationCollectionIdentifiers = notificationCollection.map(
        notificationItem => this.getNotificationIdentifier(notificationItem)!,
      );
      const notificationsToAdd = notifications.filter(notificationItem => {
        const notificationIdentifier = this.getNotificationIdentifier(notificationItem);
        if (notificationCollectionIdentifiers.includes(notificationIdentifier)) {
          return false;
        }
        notificationCollectionIdentifiers.push(notificationIdentifier);
        return true;
      });
      return [...notificationsToAdd, ...notificationCollection];
    }
    return notificationCollection;
  }
}
