import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { FormBuilder, Validators } from '@angular/forms';
import { NewPost } from 'app/entities/post/post.model';
import { PostListComponent } from 'app/entities/post/public/post-list/post-list.component';

@Component({
  standalone: true,
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, RouterModule],
})
export default class HomeComponent implements OnInit, OnDestroy {
  @ViewChild(PostListComponent) postContainer!: PostListComponent;

  account: Account | null = null;

  postForm = this.fb.group({
    content: ['', [Validators.required]],
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => (this.account = account));
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createPost(): void {
    if(this.postForm.get('content')?.value) {
      const newPost: NewPost = {
        id: null,
        content: this.postForm.get('content')?.value,
        author: {
          id: this.account?.id!,
          login: this.account?.login
        },
        likeCount: 0,
        commentCount: 0
      };
      this.postContainer.createPost(newPost).subscribe(res=> {
        if(res) {
          this.postForm.get('content')?.reset();
        }
      });
    }
  }
}
