import { Component, EventEmitter, forwardRef, OnInit, Output } from '@angular/core';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { CommentService } from '../../service/comment.service';
import { IPost } from 'app/entities/post/post.model';
import { IComment, NewComment } from '../../comment.model';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Account } from 'app/core/auth/account.model';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { CommentDeleteDialogComponent } from '../../delete/comment-delete-dialog.component';

@Component({
  selector: 'comment-dialog',
  standalone: true,
  imports: [forwardRef(() => SharedModule)],
  templateUrl: './comment-dialog.component.html',
  styleUrl: './comment-dialog.component.scss'
})
export class CommentDialogComponent implements OnInit {
  @Output() commentCount: EventEmitter<any> = new EventEmitter();

  post?: IPost;

  comments: IComment[] = [];

  account?: Account;

  commentForm = this.fb.group({
    content: ['', [Validators.required]],
  });

  constructor(
    private activeModal: NgbActiveModal,
    private commentService: CommentService,
    private router: Router,
    private fb: FormBuilder,
    private modalService: NgbModal,
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
        author: this.account,
        post: this.post
      };

      this.commentService.send(newComment).subscribe(res=>{
        if(res.body) {
          this.comments.unshift(res.body);
          this.commentForm.reset();
          this.commentCount.emit(this.comments.length);
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

  openCommentDeleteDialog(comment: IComment): void {
    const modalRef = this.modalService.open(CommentDeleteDialogComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.comment =comment;
    modalRef.componentInstance.isPublic = true;
    modalRef.closed.subscribe(reason => {
      if (reason === ITEM_DELETED_EVENT) {
        this.comments = this.comments.filter(c=>c.id!=comment.id);
        this.commentCount.emit(this.comments.length);
      }
    });
  }
}
