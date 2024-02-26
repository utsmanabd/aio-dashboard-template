import { Component } from "@angular/core";
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
    "Activity",
    "Comment",
    "Mahcine/Area",
    "PIC",
    "Picture",
  ];

  findings: any[] = [];

  imageUrl = GlobalComponent.API_URL + GlobalComponent.image;
  isLoading: boolean = false;
  breadCrumbItems!: Array<{}>;

  imageAlbum: IAlbum[] = []

  constructor(
    private apiService: restApiService,
    public common: CommonService,
    private lightbox: Lightbox
  ) {
    this.breadCrumbItems = [
      { label: "Planner" },
      { label: "Finding", active: true },
    ];
  }

  ngOnInit(): void {
    this.getFindingData();
  }

  getFindingData() {
    this.isLoading = true;
    this.apiService.getFindingNotOk().subscribe({
      next: (res: any) => {
        console.log(res.data);
        console.log(this.transformData(res.data));
        this.findings = this.transformData(res.data);
        this.isLoading = false;
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
      },
      error: (err: any) => {
        this.common.showServerErrorAlert(Const.ERR_GET_MSG("Finding"), err)
        this.isLoading = false;
      },
    });
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

  onFindingStatusChanged(activities: any[]) {
    this.common.showTextInputAlert(
      "This action will resolve the finding status",
      "Add a resolve notes",
      "Resolve"
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
