import { Component, OnInit } from '@angular/core';
import { NgIf } from "@angular/common";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { KeycloakService } from 'keycloak-angular';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';



@Component({
  selector: 'app-script-editor',
  standalone: true,
  imports: [NgIf, FormsModule, HttpClientModule, MonacoEditorModule],
  templateUrl: './script-editor.component.html',
  styleUrl: './script-editor.component.css',
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
export class ScriptEditorComponent implements OnInit{
  scriptContent1: string = '';
  scriptContent2: string = '';
  isLoading1: boolean = true;
  isLoading2: boolean = true;
  isSaving1: boolean = false;
  isSaving2: boolean = false;
  apiUrl = 'http://localhost:3002';

  editorOptions = { theme: 'vs-dark', language: 'python', automaticLayout: true };

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  public logout(): void {
    
    this.keycloakService.logout();

  }


  ngOnInit() {
    this.loadScriptTrainingModel();
    this.loadScriptInvokation();
  }

  loadScriptTrainingModel() {
    this.http.get<{ content1: string }>(`${this.apiUrl}/get-script-training`).subscribe(
      (response) => {
        this.scriptContent1 = response.content1;
        this.isLoading1 = false;
      },
      (error) => {
        console.error("Error fetching script:", error);
        this.isLoading1 = false;
      }
    );
  }

  loadScriptInvokation() {
    this.http.get<{ content2: string }>(`${this.apiUrl}/get-script-invocation`).subscribe(
      (response) => {
        this.scriptContent2 = response.content2;
        this.isLoading2 = false;
      },
      (error) => {
        console.error("Error fetching script:", error);
        this.isLoading2 = false;
      }
    );
  }

  saveScriptTrainingModel() {
    this.isSaving1 = true;
    this.http.post(`${this.apiUrl}/save-script-training`, { content: this.scriptContent1 }).subscribe(
      () => {
        this.updateModel();
        alert("Script saved successfully!");
        this.isSaving1 = false;
      },
      (error) => {
        console.error("Error saving script:", error);
        alert("Failed to save script.");
        this.isSaving1 = false;
      }
    );

  }

  saveScriptInvokation() {
    this.isSaving2 = true;
    this.http.post(`${this.apiUrl}/save-script-invocation`, { content: this.scriptContent2 }).subscribe(
      () => {
        alert("Script saved successfully!");
        this.isSaving2 = false;
      },
      (error) => {
        console.error("Error saving script:", error);
        alert("Failed to save script.");
        this.isSaving2 = false;
      }
    );

  }

  updateModel() {
    this.http.post<any>("http://127.0.0.1:5000/generate-policies", {})
        .subscribe(response => {
          if (response.success){
            console.log("Model successfully updated!");
            alert("Model updated successfully!");
          } else {
            console.log("Failed to update model.")
            alert("Failed to update model.")
          }

          this.isSaving1 = false;
          
    });

  }
  

}
