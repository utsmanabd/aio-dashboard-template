import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { Const } from 'src/app/core/static/const';

@Component({
  selector: 'app-unfinished-activity',
  templateUrl: './unfinished-activity.component.html',
  styleUrls: ['./unfinished-activity.component.scss']
})
export class UnfinishedActivityComponent {

  datePlaceholder = ''
  fromDate: string = ''
  toDate: string = ''
  selectedAreaId: number = 0;
  isLoading = false;

  unfinishedData: any[] = [];
  unfinishedDataBefore: any[] = [];
  areaData: any[] = []

  searchKeyword: string = "";
  activePages: number[] = [];
  filteredActivityData: any[] = [];
  pageSize = 10;
  currentPage = 1;
  totalPages!: number;
  paginatedActivityData: any[] = [];

  index = 0
  today: string
  userData: any

  breadCrumbItems!: Array<{}>;

  dateRange = {from: new Date(), to: new Date()}

  @ViewChild("dateRange") dateRangePicker: any
  constructor(
    private apiService: restApiService, 
    public common: CommonService, 
    private tokenStorage: TokenStorageService, 
    private route: ActivatedRoute
  ) {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear()
    const day = new Date().getDate()
    this.userData = tokenStorage.getUser()
    this.today = `${year}-${month}-${day}`
    this.fromDate = `${year}-${month}-01`
    this.toDate = `${year}-${month}-${this.common.getLastDayOfMonth(year, month)}`
    this.datePlaceholder = this.common.getMonthName(month)
    this.dateRange = {
      from: new Date(this.fromDate),
      to: new Date(this.toDate)
    }
    this.breadCrumbItems = [
      { label: 'Tasks' },
      { label: 'Unfinished', active: true }
    ];
  }

  async ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['from'] && params['to']) {
        this.fromDate = params['from']
        this.toDate = params['to']
        this.dateRange = {
          from: new Date(this.fromDate),
          to: new Date(this.toDate)
        }
        console.log(this.dateRangePicker);
        
      }
    })

    await this.getUnfinishedActivityByDate(this.fromDate, this.toDate)

  }

  ngOnDestroy() {
    this.apiService.resetCachedData("unfinishedDateData")
  }

  async getUnfinishedActivityByDate(fromDate: string, toDate: string) {
    return new Promise((resolve, reject) => {
      this.isLoading = true
      this.apiService.getDashboardUnfinishedByDateRange(fromDate, toDate).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          let data: any[] = res.data
          if (this.userData.area_id != -1) {
            this.unfinishedData = data.filter(item => item.area_id == this.userData.area_id)
          } else {
            this.unfinishedData = data
            this.unfinishedDataBefore = res.data.map((item: any) => ({...item}))
            this.areaData = this.common.getUniqueData(this.unfinishedData, 'area_id').map(item => {
              return { area_id: item.area_id, area: item.area }
            }).sort((a: any, b: any) => {
              const A: number = a.area_id
              const B: number = b.area_id
              return A - B
            })
          }
          this.totalPages = Math.ceil(this.unfinishedData.length / this.pageSize);
          this.updatePagination(this.unfinishedData);
          resolve(true)
        },
        error: (err) => {
          this.isLoading = false;
          this.common.showServerErrorAlert(Const.ERR_GET_MSG('Unfinished'), err)
          reject(err)
        }
      })
    })
  }

  onChangeDateRange(event: any) {
    const value = event.target.value as string
    const datesArray = value.split(' to ');
    if (datesArray.length === 2) {
      this.fromDate = datesArray[0]
      this.toDate = datesArray[1]
      this.dateRange = {
        from: new Date(this.fromDate),
        to: new Date(this.toDate)
      }
      this.apiService.resetCachedData("unfinishedDateData")
      this.getUnfinishedActivityByDate(this.fromDate, this.toDate)
    }
  }

  onFilterArea() {
    if (this.userData.area_id == -1) {
      this.unfinishedData = this.unfinishedDataBefore
      if (this.selectedAreaId != 0) {
        this.unfinishedData = this.unfinishedData.filter(item => item.area_id == this.selectedAreaId)
      }
      this.totalPages = Math.ceil(this.unfinishedData.length / this.pageSize);
      this.updatePagination(this.unfinishedData)
    }
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.filteredActivityData.length > 0 ? this.filteredActivityData : this.unfinishedData);
    }
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedActivityData = dataSource.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.activePages = this.common.calculateActivePages(this.currentPage, this.totalPages);
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.filteredActivityData = this.unfinishedData.filter(
      (activity: any) =>
        activity.area
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.machine_area
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.activity
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.category
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
        // activity.standard
        //   .toLowerCase()
        //   .includes(this.searchKeyword.trim().toLowerCase()) ||
    );
    this.totalPages = Math.ceil(this.filteredActivityData.length / this.pageSize);
    this.updatePagination(this.filteredActivityData);
  }
}
