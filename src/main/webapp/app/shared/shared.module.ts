import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertComponent } from './alert/alert.component';
import { AlertErrorComponent } from './alert/alert-error.component';
import { RouterModule } from '@angular/router';
import { CustomTextInputComponent } from './custom-component/custom-text-input/custom-text-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PostListComponent } from 'app/entities/post/public/post-list/post-list.component';

/**
 * Application wide Module
 */
@NgModule({
  imports: [AlertComponent, AlertErrorComponent, CustomTextInputComponent, PostListComponent],
  exports: [CommonModule, RouterModule, NgbModule, FontAwesomeModule, AlertComponent, AlertErrorComponent, FormsModule, ReactiveFormsModule, CustomTextInputComponent, PostListComponent],
})
export default class SharedModule {}
