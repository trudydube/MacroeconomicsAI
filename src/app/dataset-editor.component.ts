import { Component, OnInit } from '@angular/core';
import { NgIf } from "@angular/common";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { KeycloakService } from 'keycloak-angular';
import { NgFor } from '@angular/common';

interface DatasetRow {
  year: string;
  gdp: number;
  unemploymentRate: number;
  inflationRate: number;
  economicGrowth: number;
  quarterlyGrowth: number;
  incomeDistribution: number;
  netExports: number;
  govtExpenditure: number;
  taxRevenue: number;
  moneySupply: number;
  interestRate: number;
}


@Component({
  selector: 'app-dataset-editor',
  standalone: true,
  imports: [NgIf, FormsModule, HttpClientModule, NgFor],
  templateUrl: './dataset-editor.component.html',
  styleUrl: './dataset-editor.component.css'
})
export class DatasetEditorComponent implements OnInit{
  dataset: DatasetRow[] = [];
  scriptContent: string = '';
  isLoading: boolean = true;
  isSaving: boolean = false;
  apiUrl = 'http://localhost:3002';



  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  public logout(): void {
    
    this.keycloakService.logout();

  }


  ngOnInit() {
    this.loadScript();
  }

  loadScript() {
    this.http.get<{ content: string }>(`${this.apiUrl}/get-dataset`).subscribe(
      (response) => {
        const lines = response.content.trim().split("\n");
        const headers = lines[0].split("\t");
        this.dataset = lines.slice(1).filter(line => line.trim() !== "").map(line => {
          const columns = line.split("\t");
          return {
            year: columns[0],
            gdp: parseFloat(columns[1]),
            unemploymentRate: parseFloat(columns[2]),
            inflationRate: parseFloat(columns[3]),
            economicGrowth: parseFloat(columns[4]),
            quarterlyGrowth: parseFloat(columns[5]),
            incomeDistribution: parseFloat(columns[6]),
            netExports: parseFloat(columns[7]),
            govtExpenditure: parseFloat(columns[8]),
            taxRevenue: parseFloat(columns[9]),
            moneySupply: parseFloat(columns[10]),
            interestRate: parseFloat(columns[11]),
          };
        });
        this.isLoading = false;
      },
      (error) => {
        console.error("Error fetching dataset:", error);
        this.isLoading = false;
      }
    );
  }

  addRow() {
    this.dataset.push({
      year: '',
      gdp: 0,
      unemploymentRate: 0,
      inflationRate: 0,
      economicGrowth: 0,
      quarterlyGrowth: 0,
      incomeDistribution: 0,
      netExports: 0,
      govtExpenditure: 0,
      taxRevenue: 0,
      moneySupply: 0,
      interestRate: 0,
    });
  }

  saveScript() {
    this.isSaving = true;
    const content = this.dataset.map(row => Object.values(row).join("\t")).join("\n");
    this.http.post(`${this.apiUrl}/save-dataset`, { content }).subscribe(
      () => {
        alert("Dataset saved successfully!");
        this.isSaving = false;
      },
      (error) => {
        console.error("Error saving dataset:", error);
        alert("Failed to save dataset.");
        this.isSaving = false;
      }
    );
  }

  

}
