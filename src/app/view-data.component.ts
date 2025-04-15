import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Router } from "@angular/router";
import { KeycloakService } from "keycloak-angular";

@Component({
    selector: "app-view-data",
    templateUrl: "./view-data.component.html",
    styleUrls: ["./view-data.component.css"],
    imports: [CommonModule, HttpClientModule],
    standalone: true,
})

export class ViewDataComponent {
    historicalData: any = null;
    isLoading: boolean = false;
    
      constructor(private http: HttpClient, private router: Router, private keycloakService: KeycloakService) {}
      
          async ngOnInit() {
              await this.redirectBasedOnRole();
          }
             
          async login() {
            // Check if the user is logged in
            const isLoggedIn = await this.keycloakService.isLoggedIn();
        
            if (!isLoggedIn) {
              // If the user is not logged in, initiate the Keycloak login
              await this.keycloakService.login();
              await this.redirectBasedOnRole();
          
            } else {
              await this,this.redirectBasedOnRole();
            }
              // After login, check roles and redirect based on roles
                  
          }
            private async redirectBasedOnRole() {
              // Load user profile and roles
              const userProfile = await this.keycloakService.loadUserProfile();
              const roles = await this.keycloakService.getUserRoles(); 
          
              console.log('Roles:', roles); 
          
              if (roles.includes('PolicyMaker')) {
                this.router.navigate(['/policydashboard']);
              } else if (roles.includes('Economist') || roles.includes('Researcher')) {
                this.router.navigate(['/economistdashboard']);
              } else if (roles.includes('Admin')) {
                this.router.navigate(['/']);
              } else {
                this.router.navigate(['/']);
              }
            }

            register() {
                this.keycloakService.login({
                    action: 'register'
                });
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
