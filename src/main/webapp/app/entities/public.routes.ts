import { Routes } from "@angular/router";
import { UserDetailComponent } from "./user/detail/user-detail.component";
import { userResolve } from "./user/route/user-routing-resolve.service";
import { PublicPostDetailComponent } from "./post/public/public-post-detail/public-post-detail.component";

const publicRoutes: Routes = [
    {
        path: ':login',
        component: UserDetailComponent,
        resolve: {
            user: userResolve
        } 
    },
    {
        path: ':login/post/:postId',
        component: PublicPostDetailComponent,
    },
];

export default publicRoutes;