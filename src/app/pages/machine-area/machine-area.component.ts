import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { restApiService } from 'src/app/core/services/rest-api.service';

@Component({
  selector: 'app-machine-area',
  templateUrl: './machine-area.component.html',
  styleUrls: ['./machine-area.component.scss']
})
export class MachineAreaComponent {
  tableColumn = ["No", "Machine Area", "Area"];
  machineAreaData: any;
  index: number = 0;
  activePages: number[] = [];
  filteredMachineAreaData: any[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages!: number;
  paginatedMachineAreaData: any[] = [];
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
    this.getMachineAreaData();
  }

  getMachineAreaData() {
    this.apiService.getMachineAreaData().subscribe({
      next: (res: any) => {
        this.machineAreaData = res.data;
        this.totalPages = Math.ceil(this.machineAreaData.length / this.pageSize);
        this.updatePagination(this.machineAreaData);
      },
      error: (err) => console.error(err)
    });
    
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.machineAreaData);
    }
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedMachineAreaData = dataSource.slice(
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
    const filteredMachineAreaData = this.machineAreaData.filter(
      (activity: any) =>
        activity.area
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.machine_area
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
    );
    this.totalPages = Math.ceil(filteredMachineAreaData.length / this.pageSize);
    this.updatePagination(filteredMachineAreaData);
  }
}
