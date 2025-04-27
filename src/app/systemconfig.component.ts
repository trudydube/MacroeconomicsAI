import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { KeycloakAngularModule, KeycloakService, KeycloakEventType } from "keycloak-angular";
import { RouterModule } from "@angular/router";
import { environment } from "./environments/environment";


@Component({
    selector: "app-systemconfig",
    templateUrl: "./systemconfig.component.html",
    styleUrls: ["./systemconfig.component.css"],
    imports: [CommonModule, RouterModule],
    standalone: true,
})
export class SystemConfigComponent {
  environment = environment;

    constructor(private keycloakService: KeycloakService) {}
    
      public logout(): void {
    
        this.keycloakService.logout();
    
      }
}
