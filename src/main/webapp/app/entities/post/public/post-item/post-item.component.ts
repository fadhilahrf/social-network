import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPost } from '../../post.model';
import { IComment } from 'app/entities/comment/comment.model';
import { Router } from '@angular/router';
import { PostService } from '../../service/post.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Account } from 'app/core/auth/account.model';
import { CommentDialogComponent } from 'app/entities/comment/public/comment-dialog/comment-dialog.component';
import dayjs from 'dayjs';
import { PostUpdateDialogComponent } from '../post-update-dialog/post-update-dialog.component';
import { PostDeleteDialogComponent } from '../../delete/post-delete-dialog.component';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import SharedModule from 'app/shared/shared.module';
import { formatNumber } from 'app/shared/util/number-format-util';

@Component({
  selector: 'post-item',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './post-item.component.html',
  styleUrl: './post-item.component.scss'
})
export class PostItemComponent {
  @Output() deletedPost: EventEmitter<number> = new EventEmitter<number>();

  @Input() post?: IPost | null;

  comments: IComment[] = [];

  @Input() isInList?: boolean;

  @Input() account?: Account;

  login?: string | null;

  formatNumber = formatNumber;

  constructor(
    private router: Router, 
    private postService: PostService,
    private modalService: NgbModal,
  ) {}

  likePost(post: IPost): void {
    this.postService.likePost(post.id).subscribe(res=>{
      if(res.ok) {
        post.likedByMe=true;
        post.likeCount!++;
      }
    });
  }

  unlikePost(post: IPost): void {
    this.postService.unlikePost(post.id).subscribe(res=>{
      if(res.ok) {
        post.likedByMe=false;
        post.likeCount!--;
      }
    });
  }

  likeToggle(): void {
    if(!this.post!.likedByMe) {
      this.likePost(this.post!);
    } else {
      this.unlikePost(this.post!);
    }
  }

  openEditDialog(): void {
    const modalRef = this.modalService.open(PostUpdateDialogComponent, { size: 'md', backdrop: true });
    modalRef.componentInstance.post = this.post;
    modalRef.componentInstance.updatedPost.subscribe((updatedPost: IPost) => {
      if (updatedPost) {
        this.postService.update(updatedPost).subscribe(res=>{
          if(res.body) {
            this.post = res.body;
          }
        })
      }
    });
  }

  openPostDeleteDialog(): void {
    const modalRef = this.modalService.open(PostDeleteDialogComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.post = this.post;
    modalRef.componentInstance.isPublic = true;
    modalRef.closed.subscribe(reason => {
      if (reason === ITEM_DELETED_EVENT) {
        this.deletedPost.emit(this.post!.id);
      }
    });
  }

  openCommentDialog(): void {
    const modalRef = this.modalService.open(CommentDialogComponent, { size: 'md', backdrop: true });
    modalRef.componentInstance.post = this.post;
    modalRef.componentInstance.account = this.account;
    modalRef.componentInstance.commentCount.subscribe((commentCount: number) => {
      if (commentCount) {
        this.post!.commentCount = commentCount;
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getDateTime(date: string): string { 
    const dateTime = dayjs(date);

    return dateTime.format('HH.mm D MMMM YYYY');
  }

}
