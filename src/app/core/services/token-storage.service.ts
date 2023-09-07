import { Injectable } from '@angular/core';

const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';


@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() { }

  public getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);    
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }

  setAuthData(token: any, refreshToken: any, userData: any) {
    this.setToken(token)
    this.setRefreshToken(refreshToken)
    this.setUserData(userData)
  }

  setUserData(userData: any) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  setRefreshToken(refreshToken: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  public isTokenValid(): boolean {
      return !!this.getToken()
  }
}
