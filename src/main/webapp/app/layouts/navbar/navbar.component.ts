import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { VERSION } from 'app/app.constants';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { EntityNavbarItems } from 'app/entities/entity-navbar-items';
import NavbarItem from './navbar-item.model';
import { NotificationService } from 'app/entities/notification/service/notification.service';
import { StompService } from 'app/shared/service/stomp.service';
import { INotification } from 'app/entities/notification/notification.model';
import dayjs from 'dayjs';

@Component({
  standalone: true,
  selector: 'jhi-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [RouterModule, SharedModule, HasAnyAuthorityDirective],
})
export default class NavbarComponent implements OnInit {
  inProduction?: boolean;
  isNavbarCollapsed = true;
  openAPIEnabled?: boolean;
  version = '';
  account: Account | null = null;
  entitiesNavbarItems: NavbarItem[] = [];
  notificationsCount = 0;
  notifications: INotification[] = [];

  constructor(
    private loginService: LoginService,
    private accountService: AccountService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private stompService: StompService,
    private router: Router,
  ) {
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    }
  }

  ngOnInit(): void {
    this.entitiesNavbarItems = EntityNavbarItems;
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction = profileInfo.inProduction;
      this.openAPIEnabled = profileInfo.openAPIEnabled;
    });

    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });

    this.stompService.connect({}, ()=>{
      this.stompService.getStomp().subscribe(`/user/${this.account!.login}/notification`, (payload)=>{
        try {
          console.log(payload.body);
          if(JSON.parse(payload.body)) {
            const notification: INotification = JSON.parse(payload.body);
           
            if(notification && !notification.isRead) {
              this.notificationsCount++;
            }
          }
      } catch (error) {
          if (error instanceof TypeError) {
              console.error("Caught a TypeError:", error.message);
          } else {
              throw error;
          }
      }
      });
    }, ()=>{console.log("error")});
  }

  collapseNavbar(): void {
    this.isNavbarCollapsed = true;
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.collapseNavbar();
    this.loginService.logout();
    this.router.navigate(['']);
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  getNotifications(): void {
    this.notificationService.findAllByReceiver(this.account?.login!).subscribe(res=>{
      if(res.body) {
        this.notificationsCount = 0;
        this.notifications = res.body;
      }
    });
  }

  navigateTo(destination: string) {
    this.router.navigate([destination]);
  }

  getDateTime(date: string): string {
    const dateTime = dayjs(date);

    return dateTime.format('HH.mm D MMMM YYYY');
  }
}
