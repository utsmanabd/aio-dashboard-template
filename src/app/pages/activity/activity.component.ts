import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { restApiService } from 'src/app/core/services/rest-api.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  tableColumn = ["#", "Activity", "Machine Area", "Area", "Category", "Standard", "Periode"];
  activityData: any;
  index: number = 0;
  activePages: number[] = [];
  filteredActivityData: any[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages!: number;
  paginatedActivityData: any[] = [];
  pages: number[] = [];

  searchKeyword: string = "";
  successMessage: string = "";
  isSuccess: boolean = false;

  constructor(
    private apiService: restApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params.success === "true") {
        this.successMessage = "Data has been updated!";
        this.isSuccess = true;
      }
    });
    this.getActivityData();
  }

  getActivityData() {
    this.apiService.getActivityData().subscribe({
      next: (res: any) => {
        this.activityData = res.data;
        this.totalPages = Math.ceil(this.activityData.length / this.pageSize);
        this.updatePagination(this.activityData);
      },
      error: (err) => console.error(err)
    });
    
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.activityData);
    }
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedActivityData = dataSource.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.activePages = this.calculateActivePages();
  }

  calculateActivePages(): number[] {
    const visiblePages = 5; // Number of visible pages
    const activePages: number[] = [];

    const startPage = Math.max(
      1,
      this.currentPage - Math.floor(visiblePages / 2)
    );
    const endPage = Math.min(this.totalPages, startPage + visiblePages - 1);

    for (let page = startPage; page <= endPage; page++) {
      activePages.push(page);
    }

    return activePages;
  }

  getComputedRowNumber(index: number): number {
    return this.index + index + 1;
  }

  applyFilter(): void {
    this.currentPage = 1;
    const filteredActivityData = this.activityData.filter(
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
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.standard
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.periode
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
    );
    this.totalPages = Math.ceil(filteredActivityData.length / this.pageSize);
    this.updatePagination(filteredActivityData);
  }
}
