import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'notification',
    data: { pageTitle: 'Notifications' },
    loadChildren: () => import('./notification/notification.routes'),
  },
  {
    path: 'post',
    data: { pageTitle: 'Posts' },
    loadChildren: () => import('./post/post.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
