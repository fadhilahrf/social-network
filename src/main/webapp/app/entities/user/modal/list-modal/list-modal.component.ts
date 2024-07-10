import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IUser } from '../../user.model';
import SharedModule from 'app/shared/shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'list-modal',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './list-modal.component.html',
  styleUrl: './list-modal.component.scss'
})
export class ListModalComponent {

  users: IUser[] = [];
  title: string = '';

  constructor(
    private activeModal: NgbActiveModal,
    private router: Router
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.cancel();
  }
}
