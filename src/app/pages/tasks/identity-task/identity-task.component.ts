import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IAlbum, Lightbox } from "ngx-lightbox";
import { Observable, OperatorFunction, debounceTime, distinctUntilChanged, of, switchMap, tap } from "rxjs";
import { CommonService } from "src/app/core/services/common.service";
import { restApiService } from "src/app/core/services/rest-api.service";
import { TokenStorageService } from "src/app/core/services/token-storage.service";
import { Const } from "src/app/core/static/const";
import { GlobalComponent } from "src/app/global-component";
import { Employee } from "src/app/shared/employee.model";

interface MachineData {
  m_area_id: number,
  machine_area: string
}

@Component({
  selector: "app-identity-task",
  templateUrl: "./identity-task.component.html",
  styleUrls: ["./identity-task.component.scss"],
})
export class IdentityTaskComponent {
  taskId: number | null = null;

  taskActivityData: any[] = []
  identityTaskData: any[] = [];
  identityTaskCountData: any;

  tableColumns = [
    "No",
    "Activity",
    "Period",
    "Category",
    "Condition",
    "Comment",
    "Picture",
    "PIC Name",
  ];
  index: number = 0;

  machineAreaData: MachineData[] = [{
    m_area_id: 0,
    machine_area: ""
  }];

  mAreaArray: any[] = [];
  selectedMachineId!: number

  imageSelected: File[] = [];
  imageUrlArray: any[] = [];

  searchKeyword: string = "";

  identityTaskDataBefore: any;

  isLoading: boolean = false;
  breadCrumbItems!: Array<{}>;
  userData: any
  
  isUsernameChecked: boolean = false;
  isEditPicture: boolean = false;

  imageAlbum: IAlbum[] = []

  today: string

  searching = false;
  searchFailed = false;
  employee: any
  searchLength: number | null = null
  formatter = (employee: Employee) => employee.employee_name

  search: OperatorFunction<string, any[]> = (text$: Observable<any>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((query: string) => {
        if (query.length >= 3) {
          this.searchLength = null
          return this.apiService.getEmployeeData(query).pipe(
            tap((data) => {
              if (data.length > 0) {
                this.searchFailed = false
              } else this.searchFailed = true
              
            })
          )
        } else {
          this.searchLength = query.length
          return of([])
        }
      }),
      tap(() => {
        this.searching = false
      })
    )

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: restApiService,
    public common: CommonService,
    private tokenService: TokenStorageService,
    private lightbox: Lightbox
  ) {
    this.breadCrumbItems = [
      { label: 'Tasks' },
      { label: 'Identity Task', active: true }
    ];

    const date = new Date()
    this.today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  }

  async ngOnInit() {
    this.userData = this.tokenService.getUser()
    this.route.params.subscribe(params => {
      this.taskId = params['task-id']
    })
    if (this.taskId) this.getTaskActivityByTaskId(this.taskId).then(() => {
      this.onTabChange(this.machineAreaData[0].m_area_id)
    })
  }

  isSearchFailed(id: number, model: any): boolean {
    const index = this.getIndexById(this.identityTaskData, id)
    let result: boolean = false
    
    if (model !== this.identityTaskDataBefore[index].pic) {
      const pic = this.identityTaskData[index].pic
      if (!pic) result = true
    }

    return result
  }

  onPicSearch(id: number, pic: any) {
    const index = this.getIndexById(this.identityTaskData, id)
    setTimeout(() => {
      if (pic != undefined && pic != this.identityTaskDataBefore[index].pic) {
        const name = pic.employee_name
        const nik = pic.nik
        this.identityTaskData[index].pic = name as string
        this.identityTaskData[index].pic_nik = nik as string
      }
    }, 50)
  }

  onImageSelected(event: any, activityId: any) {
    const file = event.target.files[0];
    const renamedFile = this.common.renameFile(file, activityId)
    this.imageSelected.push(renamedFile);
  }

  onTabChange(mAreaId: number) {
    if (this.taskId && mAreaId) {
      this.selectedMachineId = mAreaId
      this.getTaskActivity(this.taskId, mAreaId);
    }
  }

  onEditPicture() {
    this.isEditPicture ? this.isEditPicture = false : this.isEditPicture = true
  }

  onUsernameCheck(event: any) {
    if (event.target.checked) this.isUsernameChecked = true
    else this.isUsernameChecked = false
  }

  async getTaskActivityByTaskId(taskId: number) {
    return new Promise((resolve, reject) => {
      this.isLoading = true
      this.apiService.getTaskActivityById(taskId).subscribe({
        next: (res: any) => {
          this.isLoading = false
          if (res.data.length > 0) {
            this.taskActivityData = res.data
            let areaId = this.taskActivityData[0].area_id
            if (areaId == this.userData.area_id || this.userData.area_id <= -1) {
              let machineArea: any = {};
  
              this.taskActivityData.forEach(item => {
                machineArea[item.machine_area] = item.m_area_id
              })
              this.machineAreaData.splice(0)
              for (let mArea in machineArea) {
                this.machineAreaData.push({machine_area: mArea, m_area_id: machineArea[mArea]})
              }
              resolve(true)
            } else {
              this.router.navigate(['../tasks'])
              this.common.showErrorAlert("You have no access to this area")
            }
            
          } else {
            this.router.navigate(['../tasks'])
            this.common.showErrorAlert("Cannot find Task with ID: " + this.taskId)
          }
        },
        error: (err) => {
          reject(err)
          this.isLoading = false
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Task Activity"), err)
        }
      })
    })
  }

  getTaskActivity(taskId: any, mAreaId: any) {
    let data = this.taskActivityData.filter(item => item.m_area_id == mAreaId)
    this.identityTaskData = data
    const imageData = this.identityTaskData.map(item => item.picture)
    this.imageAlbum.splice(0)
    imageData.forEach(image => {
      this.imageAlbum.push({
        caption: this.identityTaskData.find(item => item.picture == image).comment,
        src: this.getImageSource(image),
        thumb: this.getImageSource(`${image}`)
      })
    })
    this.identityTaskDataBefore = data.map((a: any) => ({...a}))
    this.getCountTaskActivity(taskId, mAreaId)
  }

  getCountTaskActivity(taskId: any, mAreaId: any) {
    this.apiService.getCountTaskActivityById(taskId, mAreaId).subscribe({
      next: (res: any) => this.identityTaskCountData = res.data[0],
      error: (err) => this.common.showErrorAlert(Const.ERR_GET_MSG("Task Activity Count"), err),
      complete: () => {
        const startDate = this.identityTaskCountData.date
        const endDateOrUndefined = this.identityTaskCountData.is_three_days ? this.common.getDateMinusOneSecond(this.common.getThreeDays(startDate)) : undefined
        if (!this.common.isTodayTask(this.today, startDate, endDateOrUndefined)) {
          this.router.navigate(['/tasks'])
          this.common.showErrorAlert("This task cannot be filled yet!")
        }
      }
      
    });
  }

  previewImage(id: number) {
    let album: any[] = this.imageAlbum.map(album => ({...album}))
    album.forEach((album) => {
      album.id = this.extractId(album.src)
    })
    const albumFilter = album.filter((album) => album.id !== null)
    let index = this.getIndexById(albumFilter, id, "id")
    if (this.imageAlbum.length > 0) {
      this.lightbox.open(albumFilter, index, {
        showDownloadButton: true,
        showZoom: true,
      })
    }
  }

  onSaveChanges() {
    if (this.imageSelected.length > 0) {
      const formData = new FormData();

      this.imageSelected.forEach((file) => {
        formData.append("files", file, file.name);
      });

      this.sendWithImages(formData);
    } else {
      this.sendIndentityTaskData()
    }
  }

  sendWithImages(files: FormData) {
    this.isLoading = true
    this.apiService.uploadMultipleImage(files).subscribe({
      next: (res: any) => {
        this.imageUrlArray = res.uploadedFiles;
      },
      error: (err) => {
        this.isLoading = false
        this.common.showErrorAlert(Const.ERR_INSERT_MSG("Image"), err)
      },
      complete: () => {
        this.imageSelected = [];
        if (this.imageUrlArray.length > 0) {
          let imageUrlId: any[] = [];
          this.imageUrlArray.forEach((url) => {
            imageUrlId.push(this.extractId(url));
          });
          const index = (id: number) => {
            return this.getIndexById(this.identityTaskData, id);
          };
          for (let i = 0; i < imageUrlId.length; i++) {
            this.identityTaskData[index(imageUrlId[i])].picture =
              this.imageUrlArray[i];
          }
          this.sendIndentityTaskData()
        }
      },
    });
  }

  sendIndentityTaskData() {
    let form = this.identityTaskData.filter((item, index) => {
      let result: boolean = false;
      for (let element in item) {
        if (
          this.identityTaskDataBefore[index][element] !==
          this.identityTaskData[index][element]
        ) {
          result = true;
        }
      }
      // if (this.isUsernameChecked) {
      //   item.pic = this.userData.name
      // } else item.pic = item.pic

      if (this.isSearchFailed(this.identityTaskData[index].task_activity_id, this.identityTaskData[index].pic)) result = false

      if (this.identityTaskDataBefore[index].pic_nik && this.identityTaskData[index].pic == null) {
        this.identityTaskData[index].pic_nik = this.identityTaskDataBefore[index].pic_nik
        result = false
      }

      return result;
    });

    if (form.length > 0) {
      const taskActivityData = (
        taskActivityId?: any,
        condition?: any,
        comment?: any,
        picture?: any,
        pic?: any,
        picNik?: any
      ) => {
        let data = {
          id: taskActivityId,
          data: {
            condition: condition,
            comment: comment,
            picture: picture,
            pic: pic,
            pic_nik: picNik
          },
        }
        return data
      };
      let formData: any[] = []
      form.forEach((element: any) => {
        formData.push(taskActivityData(element.task_activity_id, element.condition, element.comment, element.picture, element.pic, element.pic_nik))
      });
      
      this.isLoading = true
      this.apiService.updateTaskActivity(formData).subscribe({
        next: (res: any) => {
          this.getTaskActivityByTaskId(this.taskId!!).then(() => {
            this.onTabChange(this.selectedMachineId)
          })
          this.isLoading = false
          this.isEditPicture = false
          this.common.goToTop()
          this.common.showSuccessAlert('Task activity has been updated!', 'Return to tasks').then((result) => {
            if (result.isDenied) {
              this.router.navigate(['/tasks']);
            }
          })
        },
        error: (err: any) => {
          this.isLoading = false
          this.common.showErrorAlert(Const.ERR_UPDATE_MSG("Task Activity"), err)
        }
      })
    }
  }

  changeCondition(event: any, id: number) {
    const conditionValue = event.target.value;
    const index = this.getIndexById(this.identityTaskData, id);
    this.identityTaskData[index].condition = +conditionValue;
  }

  extractId(fileName: string): number | null {
    const match = fileName.match(/id-(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  getIndexById(arr: any[], id: number, idProperty: string = "task_activity_id"): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][idProperty] === id) {
        return i;
      }
    }
    return -1;
  }

  isConditionOk(condition: any): boolean {
    return condition === 1 ? true : false
  }

  isConditionNotOk(condition: any): boolean {
    return condition === 0 ? true : false
  }

  getImageSource(imageUrl: string): string {
    return `${GlobalComponent.API_URL}${GlobalComponent.image}${imageUrl}`
  }

  filterIdentityTaskData() {
    return this.identityTaskData.filter(
      (data: any) =>
        data.activity
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        data.periode
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        data.category
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        data.standard
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
    );
  }
}
