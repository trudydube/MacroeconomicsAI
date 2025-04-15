import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioEditorComponent } from './scenario-editor.component';

describe('ScriptEditorComponent', () => {
  let component: ScenarioEditorComponent;
  let fixture: ComponentFixture<ScenarioEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenarioEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScenarioEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
