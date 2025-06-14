import { Component, OnInit } from '@angular/core';
import { NgIf } from "@angular/common";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { KeycloakService } from 'keycloak-angular';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { environment } from './environments/environment';

@Component({
  selector: 'app-scenario-editor',
  standalone: true,
  imports: [NgIf, FormsModule, HttpClientModule, MonacoEditorModule],
  templateUrl: './scenario-editor.component.html',
  styleUrl: './scenario-editor.component.css',
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
export class ScenarioEditorComponent implements OnInit{
  scriptContent: string = '';
  isLoading: boolean = true;
  isSaving: boolean = false;
  defaultFilePath: string = "./Economic_Indicators.txt";
  environment = environment;

  editorOptions = { theme: 'vs-dark', language: 'python', automaticLayout: true };

  policyInputs = {
    govtExpenditure: 33.1,
    taxRevenue: 22.0,
    moneySupply: 8000,
    interestRate: 2.40,
    rateOfCrawl: -1.51,
  };

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  public logout(): void {
    this.keycloakService.logout();
  }

  ngOnInit() {
    this.loadScript();
    this.loadScript();
  }

  loadScript() {
    this.http.get<{ content: string }>(`${environment.nodeApiUrl}/get-scenario-script`).subscribe(
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
    this.http.post(`${environment.nodeApiUrl}/save-scenario-script`, { content: this.scriptContent }).subscribe(
      () => {
        this.updateModel();
        alert("Initiating model training... Please wait");
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

    this.http.post<any>(`${environment.flask4ApiUrl}/scenario-analysis`, this.policyInputs)
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
