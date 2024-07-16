import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommentItemComponent } from '../comment-item/comment-item.component';
import { FormBuilder, Validators } from '@angular/forms';
import { IComment, NewComment } from '../../comment.model';
import { Account } from 'app/core/auth/account.model';
import { CommentService } from '../../service/comment.service';
import { IPost } from 'app/entities/post/post.model';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'comment-list',
  standalone: true,
  imports: [SharedModule, CommentItemComponent],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
  providers: [NgbActiveModal]
})
export class CommentListComponent implements OnInit, OnChanges {
  @ViewChild('commentList', { static: true }) private commentList?: ElementRef<HTMLElement>;

  @Output() commentCount: EventEmitter<number> = new EventEmitter();

  @Output() routeHasChanged: EventEmitter<boolean> = new EventEmitter(false);

  @Input() post?: IPost;

  @Input() comments: IComment[] = [];

  @Input() account?: Account;

  @Input() targetCommentId?: number;

  commentForm = this.fb.group({
    content: ['', [Validators.required]],
  });

  constructor(
    private activeModal: NgbActiveModal,
    private commentService: CommentService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
      if(this.targetCommentId) {
        setTimeout(()=>{
          this.scrollToComment();
        }, 500);
      }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['targetCommentId']) {
      this.scrollToComment();
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

  deleteComment(id: number): void {
    this.comments = this.comments.filter(c=>c.id!=id);
    this.commentCount.emit(this.comments.length);
  }
  
  routeChange(hasChanged: boolean): void {
    this.routeHasChanged.emit(hasChanged)
  }

  scrollToComment(): void {
    if(this.comments.some(comment => comment.id === this.targetCommentId)) {
      const targetElement = <HTMLElement> document.getElementById('comment-'+this.targetCommentId);
      this.commentList!.nativeElement.scrollTop = targetElement.offsetTop;
    }
  }
}
