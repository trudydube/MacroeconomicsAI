import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { KeycloakService } from "keycloak-angular";

@Component({
    selector: "app-reports",
    templateUrl: "./reports.component.html",
    styleUrls: ["./reports.component.css"],
    imports: [CommonModule, HttpClientModule],
    standalone: true,
})

export class ReportsComponent {
    reports: any[] = [];
 
      constructor(private http: HttpClient, private keycloakService: KeycloakService) {
        this.loadUserReports();
      }

      public logout(): void {
    
        this.keycloakService.logout();
    
      }

      
        getUsername(): string {
            return this.keycloakService.getUsername();
        }
    
      loadUserReports() {
        const username = this.getUsername();

        this.http.get<any>(`http://localhost:3000/src/app/get_reports.php?username=${username}`).subscribe(response => {
            this.reports = response;
        }, error => {
            console.error("Error fetching reports:", error);
        });    
        
      }

      downloadFile(downloadUrl: string) {
        window.open(downloadUrl, "_blank");
      }
}
