import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { IUser } from "../user.model";
import { EMPTY, Observable, mergeMap, of } from "rxjs";
import { inject } from "@angular/core";
import { UserService } from "../service/user.service";
import { HttpResponse } from "@angular/common/http";

export const userResolve = (route: ActivatedRouteSnapshot): Observable<null | IUser> => {
    const login = route.params['login'];
    if (login) {
        return inject(UserService)
        .findPublicUserByLogin(login)
        .pipe(
            mergeMap((response: HttpResponse<IUser>) => {
            if (response.body) {
                return of(response.body);
            } else {
                inject(Router).navigate(['404']);
                return EMPTY;
            }
            }),
        );
    }
    return of(null);
}