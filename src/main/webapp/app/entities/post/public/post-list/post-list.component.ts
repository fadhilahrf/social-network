import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../../service/post.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IPost, NewPost } from '../../post.model';
import { FormBuilder, Validators } from '@angular/forms';
import { Account } from 'app/core/auth/account.model';
import { EMPTY, mergeMap, Observable, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { PostItemComponent } from '../post-item/post-item.component';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'post-list',
  standalone: true,
  imports: [SharedModule, PostItemComponent],
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

  deletePost(id: number): void {
    this.posts = this.posts.filter(post=>post.id!=id);
  }
}
