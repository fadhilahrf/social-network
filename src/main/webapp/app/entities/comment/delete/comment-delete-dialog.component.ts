import { Component, forwardRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IComment } from '../comment.model';
import { CommentService } from '../service/comment.service';

@Component({
  standalone: true,
  templateUrl: './comment-delete-dialog.component.html',
  imports: [forwardRef(() => SharedModule)],
})
export class CommentDeleteDialogComponent {
  comment?: IComment;

  isPublic = false;

  constructor(
    protected commentService: CommentService,
    protected activeModal: NgbActiveModal,
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    if(!this.isPublic) {
      this.commentService.delete(id).subscribe(() => {
        this.activeModal.close(ITEM_DELETED_EVENT);
      });
    } else {
      this.commentService.deleteFromPost(id).subscribe(res=> {
        if(res.ok) {
          this.activeModal.close(ITEM_DELETED_EVENT);
        }
      });
    }

  }
}
