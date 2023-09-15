import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { restApiService } from 'src/app/core/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-machine-area',
  templateUrl: './machine-area.component.html',
  styleUrls: ['./machine-area.component.scss']
})
export class MachineAreaComponent {
  tableColumn = ["#", "Machine Area", "Area"];
  machineAreaData: any;
  machineAreaId: any
  areaData: any
  areaIdArray: any[] = []
  index: number = 0;
  activePages: number[] = [];
  filteredMachineAreaData: any[] = [];

  selectedArea!: string
  machineAreaName: string = ''
  isMachineAreaNameEmpty: boolean = false
  isSelectedAreaEmpty: boolean = false

  isLoading: boolean = false

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
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params.success === "true") {
        this.successMessage = "Data has been updated!";
        this.isSuccess = true;
      }
    });
    this.getMachineAreaData();
    this.getAreaData()
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

  getAreaData() {
    this.apiService.getAreaData().subscribe({
      next: (res: any) => {
        this.areaData = res.data;
        this.areaData.forEach((area: any) => {
          this.areaIdArray.push(area.area_id)
        });
      },
      error: (err) => console.error(err),
      complete: () => this.selectedArea = this.areaIdArray[0]
    })
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.machineAreaData);
    }
  }

  openModal(content: any, machineAreaData?: any) {
    if (machineAreaData !== undefined) {
      this.machineAreaId = machineAreaData.m_area_id
      this.selectedArea = machineAreaData.area_id
      this.machineAreaName = machineAreaData.machine_area
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => this.resetModalValue(),
			(reason) => this.resetModalValue()
    )
  }

  resetModalValue() {
    if (this.areaData !== undefined) {
      this.selectedArea = this.areaIdArray[0]
    } else this.selectedArea = ''
    this.machineAreaName = ''
    this.machineAreaId = undefined
    this.isSelectedAreaEmpty = false
    this.isMachineAreaNameEmpty = false
    this.isLoading = false
  }

  onSubmitData() {
    this.validateForm()
    if (!this.isMachineAreaNameEmpty && !this.isSelectedAreaEmpty) {
      let data = { name: this.machineAreaName, area_id: this.selectedArea }
      if (this.machineAreaId !== undefined) {
        this.updateMachineAreaData(this.machineAreaId, data)
      } else {
        this.insertMachineAreaData(data)
      }
    }
  }

  onDeleteData(id: any) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(3, 142, 220)",
      cancelButtonColor: "rgb(243, 78, 78)",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.value) {
        const deleteData = { is_removed: 1 };
        this.apiService.updateMachineAreaData(id, deleteData)
          .subscribe((res: any) => {
            if (res.data == 1) {
              this.apiService.cachedMachineAreaData = undefined;
              this.getMachineAreaData();
              Swal.fire({
                title: "Deleted!",
                text: "Area has been deleted.",
                confirmButtonColor: "rgb(3, 142, 220)",
                icon: "success",
              });
            }
          });
      }
    });
  }

  updateMachineAreaData(id: any, data: any) {
    this.isLoading = true
    this.apiService.updateMachineAreaData(id, data).subscribe({
      next: (res: any) => this.modalService.dismissAll(),
      error: (err: any) => {
        console.error(err)
        this.isLoading = false
      },
      complete: () => {
        this.apiService.cachedMachineAreaData = undefined
        this.getMachineAreaData()
      }
    })
  }

  insertMachineAreaData(data: any) {
    this.isLoading = true
    this.apiService.insertMachineAreaData(data).subscribe({
      next: (res: any) => this.modalService.dismissAll(),
      error: (err: any) => {
        console.error(err)
        this.isLoading = false
      },
      complete: () => {
        this.apiService.cachedMachineAreaData = undefined
        this.getMachineAreaData()
      }
    })
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

  validateForm() {
    this.isSelectedAreaEmpty = this.selectedArea === ""
    this.isMachineAreaNameEmpty = this.machineAreaName.trim() === ""
  }
}
