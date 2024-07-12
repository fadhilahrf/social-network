import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { PostService } from '../../service/post.service';
import { IPost } from '../../post.model';
import { IComment } from 'app/entities/comment/comment.model';
import { CommentService } from 'app/entities/comment/service/comment.service';
import dayjs from 'dayjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Account } from 'app/core/auth/account.model';
import { CommentDialogComponent } from 'app/entities/comment/public/comment-dialog/comment-dialog.component';
import { PostSectionComponent } from '../post-section/post-section.component';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'public-post-detail',
  standalone: true,
  imports: [forwardRef(()=> SharedModule), PostSectionComponent],
  templateUrl: './public-post-detail.component.html',
  styleUrl: './public-post-detail.component.scss'
})
export class PublicPostDetailComponent implements OnInit {

  post?: IPost | null;

  comments: IComment[] = [];

  account?: Account | null;

  login?: string | null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private accountService: AccountService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params=>{
      this.login = params.get('login');
      const postId =params.get('postId');
      
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
}
