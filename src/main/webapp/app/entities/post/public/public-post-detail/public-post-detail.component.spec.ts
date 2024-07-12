import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicPostDetailComponent } from './public-post-detail.component';

describe('PostDetailComponent', () => {
  let component: PublicPostDetailComponent;
  let fixture: ComponentFixture<PublicPostDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicPostDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PublicPostDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
