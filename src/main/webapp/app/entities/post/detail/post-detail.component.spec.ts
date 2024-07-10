import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness, RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { PostDetailComponent } from './post-detail.component';

describe('Post Management Detail Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailComponent, RouterTestingModule.withRoutes([], { bindToComponentInputs: true })],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: PostDetailComponent,
              resolve: { post: () => of({ id: 123 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PostDetailComponent, '')
      .compileComponents();
  });

  describe('OnInit', () => {
    it('Should load post on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PostDetailComponent);

      // THEN
      expect(instance.post).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
