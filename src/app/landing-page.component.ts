import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { KeycloakAngularModule, KeycloakService, KeycloakEventType } from "keycloak-angular";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { environment } from "./environments/environment";



@Component({
    selector: "app-landing-page",
    templateUrl: "./landing-page.component.html",
    styleUrls: ["./landing-page.component.css"],
    imports: [CommonModule, HttpClientModule],
    standalone: true,
})
export class LandingPageComponent implements OnInit {

    constructor(private keycloakService: KeycloakService, private router: Router, private http: HttpClient) {}
    async ngOnInit() {
      await this.loginAndSaveUser();
      await this.redirectBasedOnRole();
    }

    async loginAndSaveUser() {
      const isLoggedIn = await this.keycloakService.isLoggedIn();

      if (!isLoggedIn) {
        this.router.navigate(['/']);
      }

      const userProfile = await this.keycloakService.loadUserProfile();
      const roles = await this.keycloakService.getUserRoles(); 

      const userData = {
          username: userProfile.username,
          roles: roles
      };

      console.log('Sending user data:', userData);

      this.http.post(`${environment.apiUrl}/src/app/saveuser.php`, userData).subscribe(
          (response: any) => {
              console.log(response.message);
          },
          (error) => {
              console.error("Error saving user:", error);
          }
      );
  }

    async login() {
      // Check if the user is logged in
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        // If the user is not logged in, initiate the Keycloak login
        await this.keycloakService.login();
        await this.redirectBasedOnRole();
    
      } else {
        await this.redirectBasedOnRole();
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
        } else if (roles.includes('admin')) {
          this.router.navigate(['/admindashboard']);
        } else {
          this.router.navigate(['/']);
        }
      }

      register() {
        this.keycloakService.login({
            action: 'register'
        });
      }
    
      public logout(): void {
        this.keycloakService.logout();
      }
}
