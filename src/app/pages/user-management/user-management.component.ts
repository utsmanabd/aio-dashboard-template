import { Component } from '@angular/core';
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

  usersData: any[] = []
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

  imageUrl = GlobalComponent.API_URL + GlobalComponent.image

  constructor(private apiService: restApiService, public common: CommonService, private modalService: NgbModal) {
    this.breadCrumbItems = [
      { label: 'Master Data' },
      { label: 'Users', active: true }
    ];
  }

  ngOnInit() {
    this.getUsersData()
  }

  getUsersData() {
    this.loading = true
    this.apiService.getUsers().subscribe({
      next: (res: any) => {
        this.loading = false
        this.usersData = res.data
        this.totalPages = Math.ceil(this.usersData.length / this.pageSize);
        this.updatePagination(this.usersData);
      },
      error: (err) => {
        this.loading = false
        this.common.showServerErrorAlert(Const.ERR_GET_MSG("Users"), err)
      }
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

}
