import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepagePresentationComponent } from './homepage-presentation.component';

describe('HomepagePresentationComponent', () => {
  let component: HomepagePresentationComponent;
  let fixture: ComponentFixture<HomepagePresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepagePresentationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomepagePresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
