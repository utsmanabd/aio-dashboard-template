import { Component } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { GlobalComponent } from 'src/app/global-component';

@Component({
  selector: 'app-finding',
  templateUrl: './finding.component.html',
  styleUrls: ['./finding.component.scss']
})
export class FindingComponent {

  columnsFinding = ["#", "Activity", "Comment", "Mahcine/Area", "PIC", "Picture"]
  findingData: any[] = [];

  imageUrl = GlobalComponent.API_URL + GlobalComponent.image
  isLoading: boolean = false;
  breadCrumbItems!: Array<{}>;

  currentPage: number = 1;
  index: number = 0;
  paginatedFindingData: any
  pageSize: number = 5
  totalPages!: number
  activePages: number[] = [];

  searchKeyword: string = "";

  constructor(private apiService: restApiService, public common: CommonService) {
    this.breadCrumbItems = [
      { label: 'Planner' },
      { label: 'Finding', active: true }
    ];
  }

  ngOnInit(): void {
    this.getFindingData()
  }

  getFindingData() {
    this.isLoading = true
    this.apiService.getFindingNotOk().subscribe({
      next: (res: any) => {
        this.findingData = res.data;
        this.isLoading = false
        this.updatePagination(this.findingData)
        this.totalPages = Math.ceil(this.findingData.length / this.pageSize);
      },
      error: (err: any) => {
        this.isLoading = false
      }
    })
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.findingData);
    }
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedFindingData = dataSource.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.activePages = this.common.calculateActivePages(this.currentPage, this.totalPages);
  }

  applyFilter(): void {
    this.currentPage = 1;
    const filteredTasksData = this.findingData.filter(
      (activity: any) =>      
        activity.area
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.machine_area
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.activity
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
    );
    this.totalPages = Math.ceil(filteredTasksData.length / this.pageSize);
    this.updatePagination(filteredTasksData);
  }
}
