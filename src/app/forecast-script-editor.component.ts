import { Component, OnInit } from '@angular/core';
import { NgIf } from "@angular/common";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { KeycloakService } from 'keycloak-angular';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { environment } from './environments/environment';

@Component({
  selector: 'app-forecast-script-editor',
  standalone: true,
  imports: [NgIf, FormsModule, HttpClientModule, MonacoEditorModule],
  templateUrl: './forecast-script-editor.component.html',
  styleUrl: './forecast-script-editor.component.css',
  providers: [
    {
      provide: NGX_MONACO_EDITOR_CONFIG,
      useValue: {
        baseUrl: '/browser/monaco',
        defaultOptions: { scrollBeyondLastLine: false },
        onMonacoLoad: () => console.log('Monaco editor loaded!'),
      }
    }
  ]
})
export class ForecastScriptEditorComponent implements OnInit{
  scriptContent: string = '';
  isLoading: boolean = true;
  isSaving: boolean = false;
  defaultFilePath: string = "./Economic_Indicators.txt";
  environment = environment;

  editorOptions = { theme: 'vs-dark', language: 'python', automaticLayout: true };

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  public logout(): void {  
    this.keycloakService.logout();
  }

  ngOnInit() {
    this.loadScript();
    this.loadScript();
  }

  loadScript() {
    this.http.get<{ content: string }>(`${environment.nodeApiUrl}/get-forecast-script`).subscribe(
      (response) => {
        this.scriptContent = response.content;
        this.isLoading = false;
      },
      (error) => {
        console.error("Error fetching script:", error);
        this.isLoading = false;
      }
    );
  }

  saveScript() {
    this.isSaving = true;
    this.http.post(`${environment.nodeApiUrl}/save-forecast-script`, { content: this.scriptContent }).subscribe(
      () => {
        this.updateModel();
        alert("Initiating model training... Please wait")
      },
      (error) => {
        console.error("Error saving script:", error);
        alert("Failed to save script.");
        this.isSaving = false;
      }
    );
  }

  updateModel() {
    const formData = new FormData();
    formData.append("default_file_path", this.defaultFilePath)
    this.http.post<any>(`${environment.flask1ApiUrl}/forecast`, formData)
        .subscribe(response => {
          if (response.success){
            console.log("Model successfully updated!");
            alert("Model updated successfully!");
          } else {
            console.log("Failed to update model.")
            alert("Failed to update model.")
          }
          this.isSaving = false;      
    });
  }
}
