import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "src/app/core/services/common.service";
import { restApiService } from "src/app/core/services/rest-api.service";
import { Const } from "src/app/core/static/const";
import { GlobalComponent } from "src/app/global-component";

@Component({
  selector: "app-identity-task",
  templateUrl: "./identity-task.component.html",
  styleUrls: ["./identity-task.component.scss"],
})
export class IdentityTaskComponent {
  taskId: number | null = null;
  areaId: number | null = null;

  identityTaskData: any;
  identityTaskCountData: any;

  tableColumns = [
    "No",
    "Activity",
    "Period",
    "Category",
    "Standard",
    "Condition",
    "Comment",
    "Picture",
    "PIC Name",
  ];
  index: number = 0;

  selectedMachineArea!: string;
  machineAreaData: any;

  mAreaArray: any[] = [];

  imageSelected: File[] = [];
  imageUrlArray: any[] = [];

  searchKeyword: string = "";

  identityTaskDataBefore: any;

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: restApiService,
    public common: CommonService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.taskId = params['task-id']
      this.areaId = params['area-id']
      console.log(params)
    })
    if (this.areaId !== null) this.getMachineAreaDataByAreaId(this.areaId);
  }

  ngOnDestroy() {
    this.identityTaskData = undefined;
  }

  onImageSelected(event: any, activityId: any) {
    const file = event.target.files[0];

    const fileName = file.name;
    const fileExt = fileName.split(".").pop();

    const newFileName = `${activityId}.` + fileExt;
    const renamedFile = this.common.renameFile(file, newFileName);

    this.imageSelected.push(renamedFile);
  }

  onSelectedMachineArea() {
    console.log(this.taskId)
    console.log(`Clicked: ${this.selectedMachineArea}`);
    if (this.taskId !== null && this.areaId !== null) {
      this.getTaskActivity(this.taskId, this.selectedMachineArea);
    }
  }

  getMachineAreaDataByAreaId(areaId: number) {
    this.isLoading = true
    this.apiService.getMachineAreaDataByAreaId(areaId).subscribe({
      next: (res: any) => {
        this.isLoading = false
        if (res.data.length > 0) {
          this.machineAreaData = res.data,
          this.machineAreaData.forEach((element: any) => {
            this.mAreaArray.push(element.m_area_id);
          });
          this.selectedMachineArea = this.mAreaArray[0]
        } else {
          this.router.navigate(['../tasks'])
          this.common.showErrorAlert("Cannot find Area with ID: " + this.areaId)
        }
      },
      error: (err) => {
        this.isLoading = false
        console.error(err)
        this.common.showServerErrorAlert(Const.ERR_GET_MSG("Machine Area"), err)
      }
    });
  }

  getTaskActivity(taskId: any, mAreaId: any) {
    this.isLoading = true
    this.apiService.getTaskActivityById(taskId, mAreaId).subscribe({
      next: (res: any) => {
        this.isLoading = false
        this.identityTaskDataBefore = res.data.map((a: any) => ({ ...a }));
        this.identityTaskData = res.data;
        this.getCountTaskActivity(taskId, mAreaId);
        if (res.data.length < 1) {
          this.common.showErrorAlert("Task activity on selected machine area is empty!")
        }
      },
      error: (err) => {
        console.error(err)
        this.common.showErrorAlert(Const.ERR_GET_MSG("Task Activity", err), Const.ERR_SERVER_TITLE, 'Retry').then((result) => {
          if (result.value) this.onSelectedMachineArea()
        })
        this.isLoading = false
      }
    });
  }

  getCountTaskActivity(taskId: any, mAreaId: any) {
    this.apiService.getCountTaskActivityById(taskId, mAreaId).subscribe({
      next: (res: any) => this.identityTaskCountData = res.data[0],
      error: (err) => {
        console.error(err)
        this.common.showErrorAlert(Const.ERR_GET_MSG("Task Activity Count", err), Const.ERR_SERVER_TITLE, 'Retry').then((result) => {
          if (result.value) this.onSelectedMachineArea()
        })
      },
    });
  }

  sendWithImages(files: FormData) {
    this.isLoading = true
    this.apiService.uploadMultipleImage(files).subscribe({
      next: (res: any) => {
        console.log(res);
        this.imageUrlArray = res.uploadedFiles;
      },
      error: (err) => {
        console.error(err)
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

  changeCondition(event: any, id: number) {
    console.log(`Value Selected: ${event.target.value}. ID: ${id}`);
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

  getIndexById(arr: any[], id: number): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].task_activity_id === id) {
        return i;
      }
    }
    return -1;
  }

  isConditionOk(condition: any): boolean {
    if (condition === 1) return true;
    else return false;
  }

  isConditionNotOk(condition: any): boolean {
    if (condition === 0) return true;
    else return false;
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

  sendIndentityTaskData() {
    let form = this.identityTaskData.filter((item: any, index: number) => {
      let result: boolean = false;
      for (let element in item) {
        if (
          this.identityTaskDataBefore[index][element] !==
          this.identityTaskData[index][element]
        ) {
          result = true;
        }
      }
      return result;
    });

    if (form.length > 0) {
      const taskActivityData = (
        taskActivityId?: any,
        condition?: any,
        comment?: any,
        picture?: any,
        pic?: any
      ) => {
        let data = {
          id: taskActivityId,
          data: {
            condition: condition,
            comment: comment,
            picture: picture,
            pic: pic,
          },
        }
        return data
      };
      let formData: any[] = []
      form.forEach((element: any) => {
        formData.push(taskActivityData(element.task_activity_id, element.condition, element.comment, element.picture, element.pic))
      });
      
      this.isLoading = true
      this.apiService.updateTaskActivity(formData).subscribe({
        next: (res: any) => console.log(res),
        error: (err: any) => {
          console.error(err)
          this.isLoading = false
          this.common.showErrorAlert(Const.ERR_UPDATE_MSG("Task Activity"), err)
        },
        complete: () => {
          this.onSelectedMachineArea()
          this.isLoading = false
          this.common.goToTop()
          this.common.showSuccessAlert('Task activity has been updated!', 'Return to tasks').then((result) => {
            if (!result.value) {
              this.router.navigate(['/tasks']);
            }
          })
        }
      })
    }
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
