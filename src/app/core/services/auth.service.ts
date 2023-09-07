import { Injectable } from "@angular/core";
import { getFirebaseBackend } from "../../authUtils";
import { User } from "../models/auth.models";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { GlobalComponent } from "../../global-component";
import { UserData } from "../models/backend-auth.model";
import { JwtHelperService } from "@auth0/angular-jwt";
import { TokenStorageService } from "./token-storage.service";

const AUTH_API = GlobalComponent.AUTH_API;

const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" }),
};

@Injectable({ providedIn: "root" })

/**
 * Auth-service Component
 */
export class AuthenticationService {
  private jwtHelper: JwtHelperService = new JwtHelperService();

  user!: User;
  public currentUserAuth: Observable<UserData>;
  // currentUserValues: any;
  private currentUserSubject: BehaviorSubject<UserData>;

  constructor(private http: HttpClient, private tokenService: TokenStorageService) {
    this.currentUserSubject = new BehaviorSubject<UserData>(
      JSON.parse(localStorage.getItem("currentUser")!)
    );
    this.currentUserAuth = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserData {
    return this.currentUserSubject.value;
  }

  /**
   * Performs the register
   * @param email email
   * @param password password
   */
  register(email: string, first_name: string, password: string) {
    // return getFirebaseBackend()!.registerUser(email, password).then((response: any) => {
    //     const user = response;
    //     return user;
    // });

    // Register Api
    return this.http.post(
      AUTH_API + "signup",
      {
        email,
        first_name,
        password,
      },
      httpOptions
    );
  }

  /**
   * Performs the auth
   * @param email email of user
   * @param password password of user
   */
  login(nik: string, password: string) {
    // return getFirebaseBackend()!.loginUser(email, password).then((response: any) => {
    //     const user = response;
    //     return user;
    // });

    return this.http.post(
      AUTH_API + "login",
      {
        nik,
        password,
      },
      httpOptions
    );
  }

  /**
   * Returns the current user
   */
  public currentUser(): any {
    return getFirebaseBackend()!.getAuthenticatedUser();
  }

  /**
   * Logout the user
   */
  logout() {
    // logout the user
    // return getFirebaseBackend()!.logout();
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    this.currentUserSubject.next(null!);
  }

  refreshToken(refreshToken: string) {
    return this.http.post(GlobalComponent.AUTH_API + GlobalComponent.refreshToken, { refreshToken: refreshToken }, httpOptions)
  }

  /**
   * Reset password
   * @param email email
   */
  resetPassword(email: string) {
    return getFirebaseBackend()!
      .forgetPassword(email)
      .then((response: any) => {
        const message = response.data;
        return message;
      });
  }

  isLoggedIn() {
    return !!localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    const token = this.tokenService.getToken()
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }
}
