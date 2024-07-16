import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import SharedModule from 'app/shared/shared.module';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { IComment } from '../../comment.model';
import { CommentDeleteDialogComponent } from '../../delete/comment-delete-dialog.component';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { Router } from '@angular/router';
import { Account } from 'app/core/auth/account.model';
import { CommentService } from '../../service/comment.service';
import { formatNumber } from 'app/shared/util/number-format-util';

@Component({
  selector: 'comment-item',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './comment-item.component.html',
  styleUrl: './comment-item.component.scss'
})
export class CommentItemComponent {
  @Output() deletedComment: EventEmitter<number> = new EventEmitter();

  @Output() routeHasChanged: EventEmitter<boolean> = new EventEmitter(false);

  @Input() comment?: IComment;

  @Input() account?: Account;

  formatNumber = formatNumber;

  constructor(
    private commentService: CommentService,
    private modalService: NgbModal,
    private router: Router,
  ) {
    dayjs.extend(relativeTime);
  }

  likeComment(comment: IComment): void {
    this.commentService.likeComment(comment.id).subscribe(res=>{
      if(res.ok) {
        comment.likedByMe=true;
        comment.likeCount!++;
      }
    });
  } 

  unlikeComment(comment: IComment): void {
    this.commentService.unlikeComment(comment.id).subscribe(res=>{
      if(res.ok) {
        comment.likedByMe=false;
        comment.likeCount!--;
      }
    });
  } 

  likeToggle(): void {
    if(!this.comment!.likedByMe) {
      this.likeComment(this.comment!);
    } else {
      this.unlikeComment(this.comment!);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.routeHasChanged.emit(true);
  }

  getDifferenceTime(date: string): string { 
    const givenDate = dayjs(date);
    const now = dayjs();
    return givenDate.from(now);
  }

  openCommentDeleteDialog(): void {
    const modalRef = this.modalService.open(CommentDeleteDialogComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.comment =this.comment;
    modalRef.componentInstance.isPublic = true;
    modalRef.closed.subscribe(reason => {
      if (reason === ITEM_DELETED_EVENT) {
        this.deletedComment.emit(this.comment!.id);
      }
    });
  }

}
