import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { IUser } from '../user.model';
import { UserService } from '../service/user.service';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-user-detail',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {

  account: Account | null = null;

  user: IUser | null = null;

  constructor(private activatedRoute: ActivatedRoute, private userService: UserService, private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });

    this.activatedRoute.data.subscribe(({ user }) => {
      this.user = user;
    });
  }

  follow(): void {
    this.userService.follow(this.user?.login!).subscribe(res=>{
      if(res.ok) {
        this.user!.isFollowed = true;
        this.user!.followerCount!++;
      }
    });
  }

  unfollow(): void {
    this.userService.unfollow(this.user?.login!).subscribe(res=>{
      if(res.ok) {
        this.user!.isFollowed = false;
        this.user!.followerCount!--;
      }
    });
  }
}
