import { Routes } from "@angular/router";
import { UserDetailComponent } from "./detail/user-detail.component";
import { userResolve } from "./route/user-routing-resolve.service";

const userRoutes: Routes = [
    {
        path: ':login',
        component: UserDetailComponent,
        resolve: {
            user: userResolve
        } 
    }
];

export default userRoutes;