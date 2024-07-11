import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PostService } from '../../service/post.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IPost, NewPost } from '../../post.model';
import dayjs from 'dayjs';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CustomTextInputComponent } from 'app/shared/custom-component/custom-text-input/custom-text-input.component';
import { FormBuilder, Validators } from '@angular/forms';
import { Account } from 'app/core/auth/account.model';
import { EMPTY, mergeMap, Observable, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { CommentDialogComponent } from 'app/entities/comment/public/comment-dialog/comment-dialog.component';
import { PostUpdateDialogComponent } from '../post-update-dialog/post-update-dialog.component';
import { PostDeleteDialogComponent } from '../../delete/post-delete-dialog.component';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  selector: 'post-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, FontAwesomeModule, CustomTextInputComponent],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss'
})
export class PostListComponent implements OnInit {

  @Input() userId?: number;

  @Input() account?: Account;

  posts: IPost[] = [];

  postForm = this.fb.group({
    content: ['', [Validators.required]],
  });

  constructor(
    private router: Router, 
    private postService: PostService,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    if(this.userId) {
      this.postService.findAllByAuthorId(this.userId).subscribe(res=>{
        if(res.body) {
          this.posts = res.body;
        }
      });
    } else {
      this.postService.findAll().subscribe(res=>{
        if(res.body) {
          this.posts = res.body;
        }
      });
    }
  }

  createPost(newPost: NewPost): Observable<null | IPost> {
    if(newPost) {
      return this.postService.create(newPost).pipe(
        mergeMap((res: HttpResponse<IPost>) => {
          if(res.body) {
            this.posts.unshift(res.body);
            return of(res.body);
          }else {
            return EMPTY;
          }
        })
      );
    }
    return of(null);
  }

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

  likeToggle(post: IPost): void {
    if(!post.likedByMe) {
      this.likePost(post);
    } else {
      this.unlikePost(post);
    }
  }

  openEditDialog(post: IPost): void {
    const modalRef = this.modalService.open(PostUpdateDialogComponent, { size: 'md', backdrop: true });
    modalRef.componentInstance.post = post;
    modalRef.componentInstance.updatedPost.subscribe((updatedPost: IPost) => {
      if (updatedPost) {
        this.postService.update(updatedPost).subscribe(res=>{
          if(res.body) {
            this.posts.forEach(p=>{
              if(p.id==res.body?.id) {
                p.content = res.body!.content;
              }
            });
          }
        })
      }
    });
  }

  openPostDeleteDialog(post: IPost): void {
    const modalRef = this.modalService.open(PostDeleteDialogComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.post = post;
    modalRef.componentInstance.isPublic = true;
    modalRef.closed.subscribe(reason => {
      if (reason === ITEM_DELETED_EVENT) {
        this.loadPosts();
      }
    });
  }

  openCommentDialog(post: IPost): void {
    const modalRef = this.modalService.open(CommentDialogComponent, { size: 'md', backdrop: true });
    modalRef.componentInstance.post = post;
    modalRef.componentInstance.account = this.account;
    modalRef.componentInstance.commentCount.subscribe((commentCount: number) => {
      if (commentCount) {
        post.commentCount = commentCount;
      }
    });
  }

  getDateTime(date: string): string { 
    const dateTime = dayjs(date);

    return dateTime.format('HH.mm D MMMM YYYY');
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
