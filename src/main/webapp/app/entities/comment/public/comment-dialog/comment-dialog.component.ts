import { Component, forwardRef, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { CommentService } from '../../service/comment.service';
import { IPost } from 'app/entities/post/post.model';
import { IComment, NewComment } from '../../comment.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

@Component({
  selector: 'comment-dialog',
  standalone: true,
  imports: [forwardRef(() => SharedModule)],
  templateUrl: './comment-dialog.component.html',
  styleUrl: './comment-dialog.component.scss'
})
export class CommentDialogComponent implements OnInit {
  post?: IPost;

  comments: IComment[] = [];

  commentForm = this.fb.group({
    content: ['', [Validators.required]],
  });

  constructor(
    private activeModal: NgbActiveModal,
    private commentService: CommentService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    dayjs.extend(relativeTime);
  }

  ngOnInit(): void {
    if(this.post) {
      this.commentService.findAllByPostId(this.post.id).subscribe(res=>{
        if(res.body) {
          this.comments = res.body;
        }
      });
    }
  }

  createComment(): void {
    if(this.commentForm.get('content')?.value) {
      const newComment: NewComment = {
        id: null,
        content: this.commentForm.get('content')?.value,
        likeCount: 0,
        author: this.post?.author,
        post: this.post
      };

      this.commentService.create(newComment).subscribe(res=>{
        if(res.body) {
          this.comments.unshift(res.body);
          this.commentForm.reset();
        }
      })
    }
  }
  
  cancel(): void {
    this.activeModal.dismiss();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.cancel();
  }

  getDifferenceTime(date: string): string { 
    const givenDate = dayjs(date);
    const now = dayjs();
    return givenDate.from(now);
  }
}
