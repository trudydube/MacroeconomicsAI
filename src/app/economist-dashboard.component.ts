import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { KeycloakAngularModule, KeycloakService, KeycloakEventType } from "keycloak-angular";


@Component({
    selector: "economist-dashboard",
    templateUrl: "./economist-dashboard.component.html",
    styleUrls: ["./economist-dashboard.component.css"],
    imports: [CommonModule],
    standalone: true,
})
export class EconomistDashboardComponent {

    constructor(private keycloakService: KeycloakService) {}
    
      public logout(): void {
    
        this.keycloakService.logout();
    
      }
}
