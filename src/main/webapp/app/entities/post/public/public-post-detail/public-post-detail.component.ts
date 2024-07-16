import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { PostService } from '../../service/post.service';
import { IPost } from '../../post.model';
import { IComment } from 'app/entities/comment/comment.model';
import { CommentService } from 'app/entities/comment/service/comment.service';
import { Account } from 'app/core/auth/account.model';
import { PostItemComponent } from '../post-item/post-item.component';
import { AccountService } from 'app/core/auth/account.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CommentListComponent } from 'app/entities/comment/public/comment-list/comment-list.component';

@Component({
  selector: 'public-post-detail',
  standalone: true,
  imports: [SharedModule, PostItemComponent, CommentListComponent],
  templateUrl: './public-post-detail.component.html',
  styleUrl: './public-post-detail.component.scss'
})
export class PublicPostDetailComponent implements OnInit {
  post?: IPost | null;

  comments: IComment[] = [];

  account?: Account | null;

  login?: string | null;

  targetCommentId?: number | null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private accountService: AccountService,
    private commentService: CommentService,
  ) {
    dayjs.extend(relativeTime);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params=>{
      this.login = params.get('login');
      this.targetCommentId = Number(params.get('commentId'));
      const postId = params.get('postId');
      
      if(postId) {
        this.postService.find(+postId).subscribe(postRes=>{
          if(postRes.body && postRes.body.author?.login == this.login) {
            this.post = postRes.body;
            this.commentService.findAllByPostId(+postId).subscribe(commentsRes=>{
              if(commentsRes.body) {
                this.comments = commentsRes.body;
              }
            });
          }
        });
      }
    });

    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });
  }

  commentCountChange(count: number): void {
    this.post!.commentCount = count;
  }
}
