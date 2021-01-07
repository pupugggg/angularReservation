import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from '@auth0/auth0-angular'

@Injectable({
  providedIn: 'root'
})
//guard to prvent user navigate invalid route
export class GuardGuard implements CanActivate {
  constructor(private auth:AuthService){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let ret:boolean=false
    this.auth.isAuthenticated$.subscribe(res=>ret=res);
    return ret;

  }
  
}
