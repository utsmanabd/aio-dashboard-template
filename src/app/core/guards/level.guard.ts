import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class LevelGuard implements CanActivate {

  constructor(private tokenService: TokenStorageService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
  {
    const expectedLevel = route.data['expectedLevel']
    const user: any = this.tokenService.getUser()

    if (user && user.level === expectedLevel) {
      return true
    } else {
      this.router.navigate(['/not-found'])
      return false;
    }
  }
  
}
