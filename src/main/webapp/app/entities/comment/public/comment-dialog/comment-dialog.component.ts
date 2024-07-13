import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { CommentService } from '../../service/comment.service';
import { IPost } from 'app/entities/post/post.model';
import { IComment } from '../../comment.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Account } from 'app/core/auth/account.model';
import { CommentItemComponent } from '../comment-item/comment-item.component';
import { CommentListComponent } from "../comment-list/comment-list.component";

@Component({
  selector: 'comment-dialog',
  standalone: true,
  imports: [SharedModule, CommentItemComponent, CommentListComponent],
  templateUrl: './comment-dialog.component.html',
  styleUrl: './comment-dialog.component.scss'
})
export class CommentDialogComponent implements OnInit {
  @Output() commentCount: EventEmitter<number> = new EventEmitter();

  post?: IPost;

  comments: IComment[] = [];

  account?: Account;

  commentForm = this.fb.group({
    content: ['', [Validators.required]],
  });

  constructor(
    private activeModal: NgbActiveModal,
    private commentService: CommentService,
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
  
  cancel(): void {
    this.activeModal.dismiss();
  }

  commentCountChange(count: number): void {
    this.commentCount.emit(count);
  }

  routeChange(hasChanged: boolean): void {
    if(hasChanged) {
      this.cancel();
    }
  }
}
