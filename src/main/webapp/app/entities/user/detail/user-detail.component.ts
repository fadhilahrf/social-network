import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { IUser } from '../user.model';
import { UserService } from '../service/user.service';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { IPost } from 'app/entities/post/post.model';
import { PostService } from 'app/entities/post/service/post.service';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ListModalComponent } from '../modal/list-modal/list-modal.component';
import { PostListComponent } from 'app/entities/post/public/post-list/post-list.component';

@Component({
  selector: 'jhi-user-detail',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {

  @ViewChild(PostListComponent) postContainer!: PostListComponent;

  account: Account | null = null;

  user: IUser | null = null;

  followers: IUser[] = [];

  following: IUser[] = [];

  posts: IPost[] = [];

  postForm = this.fb.group({
    content: ['', [Validators.required]],
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService, 
    private accountService: AccountService,  
    private postService: PostService,
    private fb: FormBuilder,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });

    this.activatedRoute.data.subscribe(({ user }) => {
      this.user = user;
      if(this.user) {
        this.postService.findAllByAuthorId(this.user?.id).subscribe(res=>{
          if(res.body) {
            this.posts = res.body;
          }
        });
      }
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

  getFollowers(): void {
    this.userService.getFollowersByUserLogin(this.user?.login!).subscribe(res=>{
      if(res.body) {
        this.followers = res.body;
        const modalRef = this.modalService.open(ListModalComponent, { size: 'sm', backdrop: true, centered: false });
        modalRef.componentInstance.title = 'Followers';
        modalRef.componentInstance.users = this.followers;
      }
    });
  }

  getFollowing(): void {
    this.userService.getFollowingByUserLogin(this.user?.login!).subscribe(res=>{
      if(res.body) {
        this.following = res.body;
        const modalRef = this.modalService.open(ListModalComponent, { size: 'sm', backdrop: true, centered: false });
        modalRef.componentInstance.title = 'Following';
        modalRef.componentInstance.users = this.following;
      }
    });
  }
}
