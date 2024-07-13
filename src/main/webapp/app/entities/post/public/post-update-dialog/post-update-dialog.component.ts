import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IPost } from '../../post.model';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'update-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './post-update-dialog.component.html',
  styleUrl: './post-update-dialog.component.scss'
})
export class PostUpdateDialogComponent implements OnInit {
  @Output() updatedPost: EventEmitter<any> = new EventEmitter();

  post?: IPost | null;

  editForm = this.fb.group({
    id: ['', [Validators.required]],
    content: ['', [Validators.required]],
  });


  constructor(
    private activeModal: NgbActiveModal, 
    private fb: FormBuilder
  ) {}


  ngOnInit(): void {
      if(this.post) {
        this.updateForm(this.post);
      }
  }

  save(): void {
    if(this.editForm.valid) {
      const editedPost: IPost = {
        ...this.post,
        id: Number(this.editForm.get('id')?.value),
        content: this.editForm.get('content')?.value
      };
      this.updatedPost.emit(editedPost);
      this.activeModal.close();
    }
  }

  updateForm(post: IPost): void {
    this.editForm.patchValue({
      id: post.id!.toString(),
      content: post.content!,
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
