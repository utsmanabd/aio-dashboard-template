import { Component, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { restApiService } from "src/app/core/services/rest-api.service";
import { DropzoneComponent, DropzoneConfigInterface } from "ngx-dropzone-wrapper";
import { GlobalComponent } from "src/app/global-component";
import { DropzoneEvent } from "ngx-dropzone-wrapper/lib/dropzone.interfaces";

interface UserData {
  image: string;
  first_name: string;
  last_name: string;
}

@Component({
  selector: "app-add-user",
  templateUrl: "./add-user.component.html",
  styleUrls: ["./add-user.component.scss"],
})
export class AddUserComponent {
  dropzoneConfig: DropzoneConfigInterface = {
    url: `${GlobalComponent.API_URL}${GlobalComponent.upload}`,
    maxFilesize: 50,
    headers: { Authorization: `${localStorage.getItem("token")}` },
    acceptedFiles: "image/*",
    addRemoveLinks: true,
    maxFiles: 1,
  };

  userId: number | null = null;

    userData: UserData = {
    image: "" ,
    first_name: "",
    last_name: "",
  };

  fName = "";
  lName = "";

  showAlerts: boolean = false;

  isFNameEmpty: boolean = false;
  isLNameEmpty: boolean = false;

  userForm!: FormGroup;
  fileName: string = ''

  constructor(
    private apiService: restApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  @ViewChild(DropzoneComponent, { static: false }) dropzone!: DropzoneComponent;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userId = +params["id"] || null;
      this.userData.first_name = params["fName"] || "";
      this.userData.last_name = params["lName"] || "";
    });
  }

  onSubmit() {
    this.validateForm();
    if (!this.isFNameEmpty && !this.isLNameEmpty) {
      if (this.userId !== null) {
        this.putUserData(this.userId, this.userData);
      } else {
        this.postUserData(this.userData);
      }
    } else return;
  }

  onUploadSuccess(event: DropzoneEvent) {
    const response: any = event[1]
    this.fileName = response.filename
    console.log(this.fileName)
    this.userData.image = this.fileName
  }

  onFileDelete(event: DropzoneEvent) {

    // if(event){
    //   this.apiService.removeImage(this.fileName).subscribe((res: any) => {
    //     if(!res.error) {
    //       console.log(`${res.message}`)
    //     } else {
    //       console.error(`${res.message}`)
    //     }
    //   })
    // }
  }

  putUserData(userId: number, userData: UserData) {
    this.apiService.putActorData(userId, userData).subscribe((res: any) => {
      if (res.data == 1) {
        this.apiService.cachedActorData = undefined
        this.router.navigate(["/user"], {
          queryParams: { success: res.status },
        });
      } else {
        this.showAlerts = true;
        setTimeout(() => {
          this.showAlerts = false;
        }, 3000);
      }
    });
  }

  postUserData(userData: UserData) {
    this.apiService.postActorData(userData).subscribe((res: any) => {
      if (res.status == true) {
        this.apiService.cachedActorData = undefined
        this.router.navigate(["/user"], {
          queryParams: { success: res.status },
        });
      } else {
        this.showAlerts = true;
        setTimeout(() => {
          this.showAlerts = false;
        }, 3000);
      }
    });
  }

  validateForm() {
    this.isFNameEmpty = this.userData.first_name.trim() === "";
    this.isLNameEmpty = this.userData.last_name.trim() === "";
  }

  closeAlert(): void {
    this.showAlerts = false;
  }
}
