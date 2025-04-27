import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { KeycloakService } from "keycloak-angular";
import { environment } from "./environments/environment";

@Component({
    selector: "app-historical-data-admin",
    templateUrl: "./historical-data-admin.component.html",
    styleUrls: ["./historical-data-admin.component.css"],
    imports: [CommonModule, HttpClientModule],
    standalone: true,
})

export class HistoricalDataAdminComponent {
    historicalData: any = null;
    isLoading: boolean = false;
    environment = environment;

    
      constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

      public logout(): void {
    
        this.keycloakService.logout();
    
      }
    
      historicaldata() {
    
        this.isLoading = true;
    
        this.http.post<any>(`${environment.flask2ApiUrl}/historical-data`, {})
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
                        rateOfCrawl: parseFloat(columns[12])
                    };
                });
    
            } else {
              this.historicalData = "Error: " + response.error;
              this.isLoading = false;
            }
          });
      }
}
