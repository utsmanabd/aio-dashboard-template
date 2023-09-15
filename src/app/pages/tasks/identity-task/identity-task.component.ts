import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { restApiService } from "src/app/core/services/rest-api.service";
import { GlobalComponent } from "src/app/global-component";
import Swal from "sweetalert2";

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
    private apiService: restApiService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.taskId = +params["id"] || null;
      this.areaId = params["areaId"] || null;
    });
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
    const renamedFile = this.renameFile(file, newFileName);

    this.imageSelected.push(renamedFile);
  }

  onSelectedMachineArea() {
    console.log(`Clicked: ${this.selectedMachineArea}`);
    if (this.taskId !== null && this.areaId !== null) {
      this.getTaskActivity(this.taskId, this.selectedMachineArea);
    }
  }

  getMachineAreaDataByAreaId(areaId: number) {
    this.apiService.getMachineAreaDataByAreaId(areaId).subscribe({
      next: (res: any) => {
        (this.machineAreaData = res.data),
          this.machineAreaData.forEach((element: any) => {
            this.mAreaArray.push(element.m_area_id);
          });
      },
      error: (err) => console.error(err),
      complete: () => (this.selectedMachineArea = this.mAreaArray[0]),
    });
  }

  getTaskActivity(taskId: any, mAreaId: any) {
    this.isLoading = true
    this.apiService.getTaskActivityById(taskId, mAreaId).subscribe({
      next: (res: any) => {
        this.identityTaskDataBefore = res.data.map((a: any) => ({ ...a }));
        this.identityTaskData = res.data;
        this.getCountTaskActivity(taskId, mAreaId);
      },
      error: (err) => {
        console.error(err)
        this.isLoading = false
      },
      complete: () => this.isLoading = false
    });
  }

  getCountTaskActivity(taskId: any, mAreaId: any) {
    this.apiService.getCountTaskActivityById(taskId, mAreaId).subscribe({
      next: (res: any) => this.identityTaskCountData = res.data[0],
      error: (err) => console.error(err),
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
      },
      complete: () => {
        this.imageSelected = [];
        if (this.imageUrlArray.length > 0) {
          let imageUrlId: any[] = [];
          this.imageUrlArray.forEach((url) => {
            imageUrlId.push(+url.substring(17, 20));
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

  getComputedRowNumber(index: number): number {
    return this.index + index + 1;
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
        },
        complete: () => {
          this.onSelectedMachineArea()
          this.isLoading = false
          this.apiService.cachedTaskData = undefined
          this.goToTop()
          this.showSuccessAlert()
        }
      })
    }
  }

  renameFile(file: File, newFileName: string): File {
    const renamedFile = new File([file], newFileName, { type: file.type });
    return renamedFile;
  }

  getDate(timestamp: any): string {
    let date = new Date(timestamp).toLocaleDateString();
    return date;
  }

  getTaskActivityPercentage(
    totalActivity: number,
    totalChecklist: number
  ): number {
    let result = Math.floor((totalChecklist / totalActivity) * 100);
    if (isNaN(result)) result = 0
    return result
  }

  getImageSource(imageUrl: string): string {
    return `${GlobalComponent.API_URL}${GlobalComponent.image}${imageUrl}`
  }

  showSuccessAlert() {
    Swal.fire({
      title: 'Success!',
      text: 'Task activity has been updated!',
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: 'rgb(3, 142, 220)',
      cancelButtonColor: 'rgb(240, 101, 72)',
      confirmButtonText: 'OK',
      cancelButtonText: 'Return to tasks'
    }).then((result) => {
      if (!result.value) {
        this.router.navigate(['/tasks']);
      }
    });
  }

  showFailedAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Something went wrong!'
    })
  }

  goToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
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
