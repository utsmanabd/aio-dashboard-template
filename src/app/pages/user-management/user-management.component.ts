import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { Const } from 'src/app/core/static/const';
import { GlobalComponent } from 'src/app/global-component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent {
  
  userId: any
  usersData: any[] = []
  rolesData: any[] = []
  tableColumns = ["#", "Photo", "NIK", "Name", "Email", "Role", "Level", "Area", "Action"]

  breadCrumbItems: Array<{}>;

  loading: boolean = false;

  index: number = 0;
  totalPages!: number;
  activePages: number[] = [];

  pageSize = 10;
  currentPage = 1;
  paginatedUsersData: any[] = [];
  searchKeyword: string = "";

  userDataForm!: UntypedFormGroup;
  submitted: boolean = false;
  showPassword!: boolean;
  showConfirmPassword!: boolean;
  error: string = ""

  isPasswordNotMatched: boolean = false;
  selectedImage: File | undefined;
  isEditPassword: boolean = false;

  nikBefore: any

  imageUrl = GlobalComponent.API_URL + GlobalComponent.image

  constructor(private formBuilder: UntypedFormBuilder, private apiService: restApiService, public common: CommonService, private modalService: NgbModal) {
    this.breadCrumbItems = [
      { label: 'Master Data' },
      { label: 'Users', active: true }
    ];
  }

  async ngOnInit() {
    await this.getUsersData()
    await this.getRoleData()
    this.userDataForm = this.createForm() 
    // this.getAIOUsers("heryansyah")
  }

  get f() {
    return this.userDataForm.controls
  }

  createForm() {
    return this.formBuilder.group({
      nik: ["", [Validators.required]],
      name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
      retype_password: ["", [Validators.required]],
      role_id: [null, [Validators.required]],
      photo: [null]
    }) 
  }

  getAIOUsers(query: string) {
    this.apiService.getAIOUser(query).subscribe({
      next: (res: any) => {
        console.log("SUCCESS");
        let data = res.data
        console.log(data)
        
      },
      error: (err: any) => {
        console.error(err);
        
      }
    })
  }

  async getUsersData() {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.getUsers().subscribe({
        next: (res: any) => {
          this.loading = false
          this.usersData = res.data
          console.log(res.data)
          this.totalPages = Math.ceil(this.usersData.length / this.pageSize);
          this.updatePagination(this.usersData);
          resolve(true)
        },
        error: (err) => {
          this.loading = false
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Users"), err)
          reject(err)
        }
      })
    })
  }

  async insertUser(userData: any) {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.insertUser(userData).subscribe({
        next: (res: any) => {
          const userId = res.data
          this.loading = false
          resolve(userId)
        },
        error: (err) => {
          this.loading = false
          this.common.showErrorAlert(Const.ERR_INSERT_MSG("User"), err)
          reject(err)
        }
      })
    })
  }

  async updateUser(userId: number, userData: any) {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.updateUser(userId, userData).subscribe({
        next: (res: any) => {
          this.loading = false
          resolve(true)
        },
        error: (err) => {
          this.loading = false
          this.common.showErrorAlert(Const.ERR_UPDATE_MSG("User"), err)
          reject(err)
        }
      })
    })
  }

  deleteUserData(userData: any) {
    const deleteData = {is_removed: 1}
    this.common.showDeleteWarningAlert(Const.ALERT_DEL_MSG(userData.name)).then((result) => {
      if (result.value) {
        this.updateUser(userData.user_id, deleteData).then(() => {
          this.getUsersData()
          this.common.showSuccessAlert(Const.SUCCESS_DEL_MSG())
        })
      }
    })
  }

  async uploadUserImage(image: File) {
    const formData = new FormData()
    formData.append("file", image)
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.uploadUserImage(formData).subscribe({
        next: (res: any) => {
          this.loading = false
          resolve(res.filename)
        },
        error: (err) => {
          this.loading = false
          this.common.showErrorAlert(Const.ERR_INSERT_MSG("User Image"), err)
          reject(err)
        }
      })
    })
  }
  
  async getRoleData() {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.getRolesData().subscribe({
        next: (res: any) => {
          this.rolesData = res.data
          this.loading = false
          resolve(true)
        },
        error: (err) => {
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Role"), err)
          this.loading = false
          reject(err)
        }
      })
    })
  }

  async isNIKExists(nik: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.isUserExists(nik).subscribe({
        next: (res: any) => {
          this.loading = false
          let isExists: boolean
          if (res.status) {
            isExists = false
          } else isExists = true
          resolve(isExists)
        },
        error: (err: any) => {
          this.loading = false
          this.common.showErrorAlert(Const.ERR_GET_MSG("Exists NIK"), err)
          reject(err)
        }
      })
    })
  }

  editPasswordMode() {
    if (this.isEditPassword === true){
      this.isEditPassword = false
      this.f["password"].setValue("")
      this.f["retype_password"].setValue("")
    } else this.isEditPassword = true
  }
  
  openModal(content: any, userData?: any) {
    console.log(userData)
    if (userData) {
      this.userId = userData.user_id
      this.f['nik'].setValue(userData.nik)
      this.f['email'].setValue(userData.email)
      this.f['name'].setValue(userData.name)
      this.f['role_id'].setValue(userData.role_id)
      this.f['photo'].setValue(userData.photo)
      this.f['password'].clearValidators()
      this.f['retype_password'].clearValidators()

      this.nikBefore = userData.nik
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg'  }).result.then(
      (result) => this.resetModalValue(),
			(reason) => this.resetModalValue()
    )
  }
  
  resetModalValue() {
    this.userId = null
    this.submitted = false
    this.selectedImage = undefined
    this.userDataForm.reset()
    this.nikBefore = undefined
    this.isEditPassword = false
    this.f['password'].addValidators(Validators.required); 
    this.f['retype_password'].addValidators(Validators.required);
  }

  onImageSelected(event$: any) {
    const image: File = event$.target.files[0]
    this.selectedImage = image
  }

  async onSubmit() {
    this.submitted = true
    if (this.f['password'].value === this.f['retype_password'].value) {
      this.isPasswordNotMatched = false
      if (this.userDataForm.valid) {
        await this.isNIKExists(this.f['nik'].value).then(async(isExists) => {
          if (!isExists || this.f['nik'].value == this.nikBefore) {
            let data: Record<string, any> = {}
            for (let key in this.f) {
              if (Object.prototype.hasOwnProperty.call(this.f, key)) {
                data[key] = this.f[key].value
              }
            }
            delete data['retype_password']
            if (this.userId) {
              if (!data['password']) delete data['password']
              if (this.selectedImage) {
                const renamedFile = this.common.renameFile(this.selectedImage, this.userId)
                await this.uploadUserImage(renamedFile).then((fileName) => {
                  data['photo'] = fileName
                })
              }
              await this.updateUser(this.userId, data).then(() => {
                this.getUsersData()
                this.modalService.dismissAll()
              })
            } else {
              await this.insertUser(data).then(async(userId: any) => {
                if (this.selectedImage) {
                  const renamedFile = this.common.renameFile(this.selectedImage, userId)
                  await this.uploadUserImage(renamedFile).then(async(fileName) => {
                    await this.updateUser(userId, {photo: fileName})
                  })
                }
              }).finally(() => {
                this.getUsersData()
                this.modalService.dismissAll()
              })
            }
          } else {
            this.common.showErrorAlert("The NIK is already exists!", "Error")
          }
        })
      }
    } else {
      this.isPasswordNotMatched = true
    }
  }


  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.usersData);
    }
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedUsersData = dataSource.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.activePages = this.common.calculateActivePages(this.currentPage, this.totalPages);
  }

  applyFilter(): void {
    this.currentPage = 1;
    const filteredUsersData = this.usersData.filter(
      (user) =>
        user.name
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        user.role_name
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        user.level
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
        // user.area
        //   .toLowerCase()
        //   .includes(this.searchKeyword.trim().toLowerCase())
    );
    this.totalPages = Math.ceil(filteredUsersData.length / this.pageSize);
    this.updatePagination(filteredUsersData);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  
  }
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

}
