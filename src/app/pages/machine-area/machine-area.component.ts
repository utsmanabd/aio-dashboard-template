import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { Const } from 'src/app/core/static/const';

@Component({
  selector: 'app-machine-area',
  templateUrl: './machine-area.component.html',
  styleUrls: ['./machine-area.component.scss']
})
export class MachineAreaComponent {
  tableColumn = ["#", "Machine Area", "Area", "Action"];
  machineAreaData: any;
  machineAreaId: any
  areaData: any
  areaIdArray: any[] = []
  index: number = 0;
  activePages: number[] = [];
  breadCrumbItems!: Array<{}>;

  selectedArea!: string
  machineAreaName: string = ''
  isMachineAreaNameEmpty: boolean = false
  isSelectedAreaEmpty: boolean = false

  loading: boolean = false
  isLoading: boolean = false

  pageSize = 10;
  currentPage = 1;
  totalPages!: number;
  paginatedMachineAreaData: any[] = [];
  searchKeyword: string = "";

  constructor(
    private apiService: restApiService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    public common: CommonService
  ) {
    this.breadCrumbItems = [
      { label: 'Master Data' },
      { label: 'Machine Area', active: true }
    ];
  }

  ngOnInit() {
    this.getMachineAreaData()
    this.getAreaData()
  }

  ngOnDestroy() {
    this.modalService.dismissAll()
  }

  getMachineAreaData() {
    this.loading = true
      this.apiService.getMachineAreaData().subscribe({
        next: (res: any) => {
          this.loading = false
          this.machineAreaData = res.data;
          this.totalPages = Math.ceil(this.machineAreaData.length / this.pageSize);
          this.updatePagination(this.machineAreaData);
        },
        error: (err) => {
          this.loading = false
          console.error(err)
          this.common.showServerErrorAlert(Const.ERR_GET_MSG('Machine Area'), err)
        }
      });
  }

  getAreaData() {
    this.loading = true
      this.apiService.getAreaData().subscribe({
        next: (res: any) => {
          this.loading = false
          this.areaData = res.data;
          this.areaData.forEach((area: any) => {
            this.areaIdArray.push(area.area_id)
          });
        },
        error: (err) => {
          this.loading = false
          console.error(err)
          this.common.showServerErrorAlert(Const.ERR_GET_MSG('Area'), err)
        },
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
    this.common.showDeleteWarningAlert().then((result) => {
      if (result.value) {
        const deleteData = { is_removed: 1 };
        this.loading = true
        this.apiService.updateMachineAreaData(id, deleteData)
          .subscribe({
            next: (res: any) => {
              this.loading = false
              if (res.data == 1) {
                this.getMachineAreaData();
                this.common.showSuccessAlert('Machine has been deleted')
              }
            },
            error: (err) => {
              this.loading = false
              console.error(err);
              this.common.showErrorAlert(Const.ERR_DELETE_MSG('Machine Area'), err)
            }
          });
      }
    })
  }

  updateMachineAreaData(id: any, data: any) {
    this.isLoading = true
    this.apiService.updateMachineAreaData(id, data).subscribe({
      next: (res: any) => this.modalService.dismissAll(),
      error: (err) => {
        console.error(err)
        this.isLoading = false
        this.common.showErrorAlert(Const.ERR_UPDATE_MSG('Machine Area'), err)
      },
      complete: () => {
        this.getMachineAreaData()
        this.isLoading = false
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
        this.common.showErrorAlert(Const.ERR_INSERT_MSG('Machine Area'), err)
      },
      complete: () => {
        this.getMachineAreaData()
        this.isLoading = false
      }
    })
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedMachineAreaData = dataSource.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.activePages = this.common.calculateActivePages(this.currentPage, this.totalPages);
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
