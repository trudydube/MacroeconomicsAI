import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastScriptEditorComponent } from './forecast-script-editor.component';

describe('ScriptEditorComponent', () => {
  let component: ForecastScriptEditorComponent;
  let fixture: ComponentFixture<ForecastScriptEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForecastScriptEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForecastScriptEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
