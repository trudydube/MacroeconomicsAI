import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { KeycloakAngularModule, KeycloakService, KeycloakEventType } from "keycloak-angular";


@Component({
    selector: "app-admin-dashboard",
    templateUrl: "./admin-dashboard.component.html",
    styleUrls: ["./admin-dashboard.component.css"],
    imports: [CommonModule],
    standalone: true,
})
export class AdminDashboardComponent {

    constructor(private keycloakService: KeycloakService) {}
    
      public logout(): void {
    
        this.keycloakService.logout();
    
      }
}
