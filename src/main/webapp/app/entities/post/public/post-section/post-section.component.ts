import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import SharedModule from 'app/shared/shared.module';
import { IPost } from '../../post.model';
import { IComment } from 'app/entities/comment/comment.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostService } from '../../service/post.service';
import { CommentService } from 'app/entities/comment/service/comment.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Account } from 'app/core/auth/account.model';
import { CommentDialogComponent } from 'app/entities/comment/public/comment-dialog/comment-dialog.component';
import dayjs from 'dayjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { CustomTextInputComponent } from 'app/shared/custom-component/custom-text-input/custom-text-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PostUpdateDialogComponent } from '../post-update-dialog/post-update-dialog.component';
import { PostDeleteDialogComponent } from '../../delete/post-delete-dialog.component';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  selector: 'post-section',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, FontAwesomeModule, FormsModule, ReactiveFormsModule, CustomTextInputComponent],
  templateUrl: './post-section.component.html',
  styleUrl: './post-section.component.scss'
})
export class PostSectionComponent {
  @Output() deletedPost: EventEmitter<number> = new EventEmitter<number>();

  @Input() post?: IPost | null;

  comments: IComment[] = [];

  @Input() isInList?: boolean;

  @Input() account?: Account;

  login?: string | null;

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
    })
  }

  unlikePost(post: IPost): void {
    this.postService.unlikePost(post.id).subscribe(res=>{
      if(res.ok) {
        post.likedByMe=false;
        post.likeCount!--;
      }
    })
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
