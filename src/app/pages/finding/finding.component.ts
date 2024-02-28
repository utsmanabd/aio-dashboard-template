import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IAlbum, Lightbox } from "ngx-lightbox";
import { CommonService } from "src/app/core/services/common.service";
import { restApiService } from "src/app/core/services/rest-api.service";
import { Const } from "src/app/core/static/const";
import { GlobalComponent } from "src/app/global-component";

@Component({
  selector: "app-finding",
  templateUrl: "./finding.component.html",
  styleUrls: ["./finding.component.scss"],
})
export class FindingComponent {
  columnsFinding = [
    "#",
    "Updated at",
    "Activity",
    "Comment",
    "Mahcine/Area",
    "PIC",
    "Picture",
  ];

  findings: any[] = [];
  findingData: any[] = [];

  imageUrl = GlobalComponent.API_URL + GlobalComponent.image;
  isLoading: boolean = false;
  breadCrumbItems!: Array<{}>;

  imageAlbum: IAlbum[] = []
  isTableView: boolean = false

  index = 0
  activePages: number[] = [];
  pageSize = 10;
  currentPage = 1;
  totalPages!: number;
  paginatedFindingData: any[] = [];
  filteredFindingData: any[] = [];

  searchKeyword: string = "";

  constructor(
    private apiService: restApiService,
    public common: CommonService,
    private lightbox: Lightbox,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.breadCrumbItems = [
      { label: "Planner" },
      { label: "Finding", active: true },
    ];
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params.tableView === "true") {
        this.isTableView = true
      } else {
        this.isTableView = false
      }
    });

    this.getFindingData();
  }

  getFindingData() {
    this.isLoading = true;
    this.apiService.getFindingNotOk().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.findings = this.transformData(res.data);
        this.imageAlbum.splice(0)
        this.findings.forEach(area => {
          area.detail.forEach((machine: any) => {
            machine.finding.forEach((activity: any) => {
              activity.detail.forEach((finding: any) => {
                this.imageAlbum.push({
                  caption: finding.comment,
                  src: this.imageUrl + finding.picture,
                  thumb: this.imageUrl + finding.picture
                })
              })
            })
          })
        })
        const rawData: any[] = res.data
        this.findingData = rawData.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        this.findingData.forEach(item => item.pic !== null ? item.pic : item.pic = '')
        console.log(this.findingData);
        
        this.totalPages = Math.ceil(this.findingData.length / this.pageSize);
        this.updatePagination(this.findingData);
      },
      error: (err: any) => {
        this.common.showServerErrorAlert(Const.ERR_GET_MSG("Finding"), err)
        this.isLoading = false;
      },
    });
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedFindingData = dataSource.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.activePages = this.common.calculateActivePages(this.currentPage, this.totalPages);
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.filteredFindingData.length > 0 ? this.filteredFindingData : this.findingData);
    }
  }

  applyFilter(): void {
    console.log(this.searchKeyword);
    
    this.currentPage = 1;
    this.filteredFindingData = this.findingData.filter(finding => {
      return finding.activity.toLowerCase().includes(this.searchKeyword.trim().toLowerCase()) ||
        finding.standard.toLowerCase().includes(this.searchKeyword.trim().toLowerCase()) ||
        finding.machine_area.toLowerCase().includes(this.searchKeyword.trim().toLowerCase()) ||
        finding.pic.toLowerCase().includes(this.searchKeyword.trim().toLowerCase())
    })
    this.totalPages = Math.ceil(this.filteredFindingData.length / this.pageSize)
    this.updatePagination(this.filteredFindingData)
  }

  previewImage(id: number) {
    let album: any[] = this.imageAlbum.map(album => ({...album}))
    album.forEach(image => {
      image.id = this.extractId(image.src)
    })
    const albumFilter = album.filter(image => image.id !== null);
    let index = this.getIndexById(albumFilter, id, "id");
    if (this.imageAlbum.length > 0) {
      this.lightbox.open(albumFilter, index, {
        showDownloadButton: true,
        showZoom: true
      })
    }
  }

  getIndexById(arr: any[], id: number, idProperty: string = "task_activity_id"): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][idProperty] === id) {
        return i;
      }
    }
    return -1;
  }

  extractId(fileName: string): number | null {
    const match = fileName.match(/id-(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  transformData(data: any[]): any[] {
    let transformedData: any[] = [];

    data.forEach((item) => {
      let existingArea = transformedData.find(
        (area) => area.area_id === item.area_id
      );

      if (existingArea) {
        let existingDetail = existingArea.detail.find(
          (detail: any) => detail.m_area_id === item.m_area_id
        );

        if (existingDetail) {
          let existingFinding = existingDetail.finding.find(
            (finding: any) => finding.activity_id === item.activity_id
          );

          if (existingFinding) {
            existingFinding.detail.push({
              date: item.date,
              updated_at: item.updated_at,
              task_activity_id: item.task_activity_id,
              comment: item.comment,
              picture: item.picture,
              pic: item.pic,
            });
          } else {
            existingDetail.finding.push({
              activity_id: item.activity_id,
              activity: item.activity,
              standard: item.standard,
              detail: [
                {
                  date: item.date,
                  updated_at: item.updated_at,
                  task_activity_id: item.task_activity_id,
                  comment: item.comment,
                  picture: item.picture,
                  pic: item.pic,
                },
              ],
            });
          }
        } else {
          existingArea.detail.push({
            m_area_id: item.m_area_id,
            machine_area: item.machine_area,
            finding: [
              {
                activity_id: item.activity_id,
                activity: item.activity,
                standard: item.standard,
                detail: [
                  {
                    date: item.date,
                    updated_at: item.updated_at,
                    task_activity_id: item.task_activity_id,
                    comment: item.comment,
                    picture: item.picture,
                    pic: item.pic,
                  },
                ],
              },
            ],
          });
        }
      } else {
        transformedData.push({
          area_id: item.area_id,
          area: item.area,
          detail: [
            {
              m_area_id: item.m_area_id,
              machine_area: item.machine_area,
              finding: [
                {
                  activity_id: item.activity_id,
                  activity: item.activity,
                  standard: item.standard,
                  detail: [
                    {
                      date: item.date,
                      updated_at: item.updated_at,
                      task_activity_id: item.task_activity_id,
                      comment: item.comment,
                      picture: item.picture,
                      pic: item.pic,
                    },
                  ],
                },
              ],
            },
          ],
        });
      }
    });

    return transformedData;
  }

  onSelectedViewCheck(event: any) {
    if (event.target.id == 'btnCalendar') {
      this.isTableView = false
      this.router.navigate(["/planner/finding"], {
        queryParams: { tableView: false },
      });
    } else if (event.target.id == 'btnTableView') {
      this.isTableView = true
      this.router.navigate(["/planner/finding"], {
        queryParams: { tableView: true },
      });
    }
  }

  onFindingStatusChanged(activities: any[]) {
    this.common.showTextInputAlert(
      "Resolve Finding",
      "Are you sure you want to solve the finding status?",
      "Add a resolve notes",
      "Solve"
    ).then((result) => {
      if (result.isConfirmed) {
        let formData: any[] = [];
        activities.forEach(item => {
          formData.push({
            id: item.task_activity_id, 
            data: {
              condition: 1, 
              comment: result.value ? result.value : null
            }
          })
        })
        console.log(formData);
        this.updateTaskActivity(formData).then(() => {
          setTimeout(() => {
            this.getFindingData()
            this.common.showSuccessAlert("Finding has been resolved")
          }, 300)
          
        })
      }
      
    })
  }

  async updateTaskActivity(data: any) {
    return new Promise((resolve, reject) => {
      this.isLoading = true
      this.apiService.updateTaskActivity(data).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          resolve(true)
        },
        error: (err) => {
          this.common.showErrorAlert(Const.ERR_UPDATE_MSG("Task Activity"), err);
          this.isLoading = false;
          reject(err)
        }
      })
    })
  }
}
