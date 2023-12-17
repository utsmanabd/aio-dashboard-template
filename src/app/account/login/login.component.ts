import { Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

// Login Auth
import { AuthenticationService } from "../../core/services/auth.service";
import { ToastService } from "./toast-service";
import { TokenStorageService } from "src/app/core/services/token-storage.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})

/**
 * Login Component
 */
export class LoginComponent implements OnInit {
  // Login Form
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = "";
  returnUrl!: string;
  isRemembered: boolean = false;
  isLoginFailed: boolean = false;
  errorMessage: string = "";
  isOnRefresh: boolean = false;
  // set the current year
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private tokenService: TokenStorageService,
    private route: ActivatedRoute,
    public toastService: ToastService,
  ) {
    // redirect to home if already logged in
    // if (this.authenticationService.currentUserValue) {
    //   this.router.navigate(["/"]);
    // }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params.returnUrl) {
        this.returnUrl = params.returnUrl
      }
    })
    /**
     * Form Validatyion
     */
    this.loginForm = this.formBuilder.group({
      nik: ["", [Validators.required]],
      password: ["", [Validators.required]],
    });

    
    // get return url from route parameters or default to '/'
    if (!this.authenticationService.isAuthenticated()) {
      const refreshToken = this.tokenService.getRefreshToken();
      if (refreshToken !== null) {
        this.updateToken(refreshToken)
      } else {
        return;
      }
    } else {
      this.isOnRefresh = true
      if (this.returnUrl) this.router.navigateByUrl(this.returnUrl)
      else this.router.navigate(['/'])
    }
    // this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Form submit
   */

  onRememberMeChecked() {
    if (!this.isRemembered) {
      this.isRemembered = true;
    } else this.isRemembered = false;
  }
  onSubmit() {
    this.submitted = true;
    this.isLoginFailed = false
    this.authenticationService.login(this.f["nik"].value, this.f["password"].value)
      .subscribe({
        next: (data: any) => {
          if (!data.error) {
            if (!this.isRemembered) {
              this.tokenService.setToken(data.token);
              this.tokenService.setUserData(data.userData);
            } else {
              this.tokenService.setAuthData(
                data.token,
                data.refreshToken,
                data.userData
              );
            }
            if (this.returnUrl) this.router.navigateByUrl(this.returnUrl)
            else this.router.navigate(["/"]);
          
          } else {
            this.errorMessage = data.message
            this.isLoginFailed = true;
          }
        },
        error: (err) => {
          this.errorMessage = `${err}`;
          this.isLoginFailed = true;
        }
      });
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  updateToken(token: any) {
    this.isOnRefresh = true
    this.authenticationService.updateToken(token).subscribe({
      next: (res: any) => {
        if (!res.error && res.accessToken) {
          this.tokenService.setToken(res.accessToken);
          this.tokenService.setUserData(res.payload.data)
        } else {
          console.error(res.message)
          this.isOnRefresh = false
        }
      },
      error: (err) => console.error(err),
      complete: () => {
        this.isOnRefresh = false
        if (this.returnUrl) this.router.navigateByUrl(this.returnUrl)
        else this.router.navigate(['/'])
      }
    })
  }
}
