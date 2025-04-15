import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { KeycloakAngularModule, KeycloakService, KeycloakEventType } from "keycloak-angular";


@Component({
    selector: "app-policy-maker-dashboard",
    templateUrl: "./policy-maker-dashboard.component.html",
    styleUrls: ["./policy-maker-dashboard.component.css"],
    imports: [CommonModule],
    standalone: true,
})
export class PolicyMakerDashboardComponent {

    constructor(private keycloakService: KeycloakService) {}
    
      public logout(): void {
    
        this.keycloakService.logout();
    
      }
}
