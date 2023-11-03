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
  tableColumns = ["#", "Photo", "NIK", "Name", "Role", "Level", "Area", "Action"]

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
  fieldTextType!: boolean;
  error: string = ""

  isPasswordNotMatched: boolean = false;
  selectedImage: File | undefined;
  isEditPassword: boolean = false;

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
  }

  get f() {
    return this.userDataForm.controls
  }

  editPasswordMode() {
    this.isEditPassword === true ? this.isEditPassword = false : this.isEditPassword = true
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

  async getUsersData() {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.getUsers().subscribe({
        next: (res: any) => {
          this.loading = false
          this.usersData = res.data
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

  insertUser(userData: any) {
    this.loading = true
    this.apiService.insertUser(userData).subscribe({
      next: (res: any) => {
        this.loading = false
      },
      error: (err) => {
        this.loading = false
        this.common.showErrorAlert(Const.ERR_INSERT_MSG("User"), err)
      }
    })
  }

  updateUser(userId: number, userData: any) {
    this.loading = true
    this.apiService.updateUser(userId, userData).subscribe({
      next: (res: any) => {
        this.loading = false
      },
      error: (err) => {
        this.loading = false
        this.common.showErrorAlert(Const.ERR_UPDATE_MSG("User"), err)
      }
    })
  }

  deleteUserData(userId: any) {
    const deleteData = {is_removed: 1}
    this.updateUser(userId, deleteData)
  }

  uploadUserImage(image: File) {
    const formData = new FormData()
    formData.append("file", image)
    this.loading = true
    this.apiService.uploadUserImage(formData).subscribe({
      next: (res: any) => {
        this.loading = false
      },
      error: (err) => {
        this.loading = false
        this.common.showErrorAlert(Const.ERR_INSERT_MSG("User Image"), err)
      }
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
  
  openModal(content: any, userData?: any) {
    if (userData) {
      this.userId = userData.user_id
      this.f['nik'].setValue(userData.nik)
      this.f['email'].setValue(userData.email)
      this.f['name'].setValue(userData.name)
      this.f['role_id'].setValue(userData.role_id)
      this.f['photo'].setValue(userData.photo)
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
  }

  onImageSelected(event$: any) {
    const image: File = event$.target.files[0]
    this.selectedImage = image
  }

  onSubmit() {
    console.log(this.userDataForm.errors)
    this.submitted = true
    if (this.userDataForm.valid && this.f['password'].value === this.f['retype_password'].value) {
      console.log("TRUE");
      this.isPasswordNotMatched = false
      let data: Record<string, any> = {}
      for (let key in this.f) {
        if (Object.prototype.hasOwnProperty.call(this.f, key)) {
          data[key] = this.f[key].value
        }
      }
      // delete data['retype_password']
      console.log(data)
    } else {
      this.isPasswordNotMatched = true
      console.log("FALSE")

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

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

}
