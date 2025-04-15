import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { KeycloakService } from "keycloak-angular";

@Component({
    selector: "app-historical-data",
    templateUrl: "./historical-data-economist.component.html",
    styleUrls: ["./historical-data-economist.component.css"],
    imports: [CommonModule, HttpClientModule],
    standalone: true,
})

export class HistoricalDataEconomistComponent {
    historicalData: any = null;
    isLoading: boolean = false;
    
      constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

      public logout(): void {
    
        this.keycloakService.logout();
    
      }
    
      historicaldata() {
    
        this.isLoading = true;
    
        this.http.post<any>("http://127.0.0.1:5002/historical-data", {})
          .subscribe(response => {
    
            this.isLoading = false;
    
            if (response.success) {
                const lines = response.output.trim().split("\n");
                const headers = lines[0].split("\t")
                this.historicalData = lines.slice(1).filter((line: string) => line.trim() !== "").map((line: string) => {
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
    
            } else {
              this.historicalData = "Error: " + response.error;
              this.isLoading = false;
            }
          });
      }
}
