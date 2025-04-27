import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { KeycloakOperationService } from './keycloak.service';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(protected readonly keycloak: KeycloakService, protected override readonly router: Router) {
    super(router, keycloak)
  }

  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    // Check if the user is logged in
    if (!this.authenticated) {
      this.router.navigate(['/']); // Redirect to landing page if not logged in
      return false;
    }

    
    const userRoles = this.keycloak.getUserRoles();
    console.log('Roles:', userRoles); 
    const requiredRoles = route.data['roles'];

    // Check if the user has the required roles
    const hasRole = requiredRoles.some((role: string) => userRoles.includes(role));

    if (!hasRole) {
      this.router.navigate(['/']); 
      return false;
    }

    // Allow access if the user has the correct role
    return true;
  }
}
