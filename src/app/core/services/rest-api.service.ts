import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, map, of, tap, throwError } from "rxjs";
import { GlobalComponent } from "../../global-component";

@Injectable({
  providedIn: "root",
})
export class restApiService {
  public httpOptions(): any {
    return {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
    };
  }

  constructor(private http: HttpClient) {}

  cache: any[] = []

  // Cache Management

  resetCachedData(cachedData?:string) {
    if (cachedData) {
      const index = this.cache.findIndex((item) => item[cachedData])
      if (index >= 0) {
        this.cache.splice(index, 1)
      } else throwError(`${cachedData} not found!`)
    } else {
      this.cache.splice(0)
    }
  }

  isCachedDataExists(cachedData:string): boolean {
    const data = this.cache.find((item) => item[cachedData])
    return data ? true : false
  }
  
  getCachedData(cachedData: string): any {
    const data = this.cache.find((item) => item[cachedData])
    if (data) {
      return data[cachedData]
    } else throwError(`${cachedData} not found`)
  }

  setCachedData(cacheKey: string, data: any) {
    this.cache.push({[cacheKey]: data})
  }

  // Image Handler API

  removeImage(image: string) {
    return this.http.delete(GlobalComponent.API_URL + `master/` + GlobalComponent.image + image, this.httpOptions())
  }

  getImage(image: string) {
    return this.http.get(
      GlobalComponent.API_URL + GlobalComponent.image + image,
      this.httpOptions()
    )
  }

  uploadAreaImage(files: FormData) {
    return this.http.post(GlobalComponent.API_URL + GlobalComponent.upload + `area`, files)
  }

  uploadMultipleImage(files: FormData) {
    return this.http.post(GlobalComponent.API_URL + GlobalComponent.uploadMultiple + `task-activity`, files)
  }

  // Activity API

  getActivityData() {
    const cacheKey = "activityData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.activity, this.httpOptions()).pipe(
        tap((data) => {
          this.setCachedData(cacheKey, data)
        })
      );
    }
  }

  getActivityDataByAreaId(areaId: any) {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.activityId + `area/${areaId}`, this.httpOptions())
  }

  insertActivityData(data: any) {
    return this.http.post(GlobalComponent.API_URL + GlobalComponent.activity, {form_data: data}, this.httpOptions()).pipe(
      tap(() => {
        this.resetCachedData()
      })
    )
  }

  updateActivityData(id: number, data: any) {
    return this.http.put(GlobalComponent.API_URL + GlobalComponent.activityId + id, {form_data: data}, this.httpOptions()).pipe(
      tap(() => {
        this.resetCachedData()
      })
    )
  }

  // Area API

  getAreaData() {
    const cacheKey = "areaData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.area, this.httpOptions()).pipe(
        tap((data) => {
          this.setCachedData(cacheKey, data);
        })
      );
    }
  }

  insertAreaData(data: any) {
    return this.http.post(GlobalComponent.API_URL + GlobalComponent.area, {form_data: data}, this.httpOptions()).pipe(
      tap(() => {
        this.resetCachedData()
      })
    )
  }

  updateAreaData(id: any, data: any) {
    return this.http.put(GlobalComponent.API_URL + GlobalComponent.areaId + id, {form_data: data}, this.httpOptions()).pipe(
      tap(() => {
        this.resetCachedData()
      })
    )
  }

  // Machine Area API

  getMachineAreaData() {
    const cacheKey = "machineAreaData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.machineArea, this.httpOptions()).pipe(
        tap((data) => {
          this.setCachedData(cacheKey, data)
        })
      );
    }
  }

  getMachineAreaDataByAreaId(id: number) {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.machineAreaId + `area/` + id, this.httpOptions())
  }

  insertMachineAreaData(data: any) {
    return this.http.post(GlobalComponent.API_URL + GlobalComponent.machineArea, {form_data: data}, this.httpOptions()).pipe(
      tap(() => {
        this.resetCachedData()
      })
    )
  }

  updateMachineAreaData(id: number, data: any) {
    return this.http.put(GlobalComponent.API_URL + GlobalComponent.machineAreaId + id, {form_data: data}, this.httpOptions()).pipe(
      tap(() => {
        this.resetCachedData()
      })
    )
  }

  // Tasks API

  getTaskData() {
    const cacheKey = "taskData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.task, this.httpOptions()).pipe(
        tap((data) => {
          this.setCachedData(cacheKey, data)
        })
      );
    }
  }

  getTaskDataByDate(month: number, year: number) {
    const cacheKey = "taskDateData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.taskId + `date/${month}/${year}`, this.httpOptions()).pipe(
        tap((data) => {
          this.setCachedData(cacheKey, data)
        })
      )
    }
  }

  insertTaskData(taskData: any) {
    return this.http.post(GlobalComponent.API_URL + GlobalComponent.task, {form_data: taskData}, this.httpOptions()).pipe(
      tap(() => {
        this.resetCachedData()
      })
    )
  }

  updateTaskData(taskId: number, taskData: any) {
    return this.http.put(GlobalComponent.API_URL + GlobalComponent.taskId + taskId, {form_data: taskData}, this.httpOptions()).pipe(
      tap(() => this.resetCachedData())
    )
  }

  // Task Activity API

  getTaskActivityById(taskId: number, mAreaId?: number) {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.taskActivityId + `${mAreaId ? 'id/' + taskId.toString() + '/' + mAreaId.toString() : 'task-id/' + taskId.toString()}`, this.httpOptions())
  }

  getCountTaskActivity() {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.taskId + `count`, this.httpOptions())
  }

  getCountTaskActivityById(taskId: number, mAreaId: number) {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.taskActivityId + `count/${taskId}/${mAreaId}`, this.httpOptions())
  }

  insertTaskActivity(data: any) {
    return this.http.post(GlobalComponent.API_URL + GlobalComponent.taskActivity, {form_data: data}, this.httpOptions()).pipe(
      tap(() => {
        this.resetCachedData()
      })
    )
  }

  updateTaskActivity(data: any) {
    return this.http.post(GlobalComponent.API_URL + GlobalComponent.taskActivityId + `batch`, {form_data: data}, this.httpOptions()).pipe(
      tap(() => {
        this.resetCachedData()
      })
    )
  }

  updateTaskActivityByTaskId(taskId: number, data: any) {
    return this.http.put(GlobalComponent.API_URL + GlobalComponent.taskActivityId + `task-id/${taskId}`, {form_data: data}, this.httpOptions()).pipe(
      tap(() => {
        this.resetCachedData()
      })
    )
  }

  // Finding API

  getFindingCount() {
    const cacheKey = "findingCountData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.finding, this.httpOptions()).pipe(
        tap((data) => {
          this.setCachedData(cacheKey, data)
        })
      )
    }
  }

  getFindingCountByDate(month: number, year: number) {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.findingDate + `${month}/${year}`, this.httpOptions())
  }

  getFindingNotOk() {
    const cacheKey = "findingData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.findingNotOk, this.httpOptions()).pipe(
        tap((data) => {
          this.setCachedData(cacheKey, data)
        })
      )
    }
  }

  getFindingNotOkByDate(month: number, year: number) {
    const cacheKey = "findingDateData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    }
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.findingNotOkDate + `${month}/${year}`, this.httpOptions()).pipe(
      tap((data) => this.setCachedData(cacheKey, data))
    )
  }

  getFindingNotOkById(taskId: number) {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.findingNotOk + `${taskId}`, this.httpOptions())
  }

  getFindingUnfinished() {
    const cacheKey = "unfinishedData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.findingUnfinished, this.httpOptions()).pipe(
        tap((data) => {
          this.setCachedData(cacheKey, data)
        })
      )
    }
  }

  getFindingUnfinishedByDate(month: number, year: number) {
    const cacheKey = "unfinishedDateData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.findingUnfinishedDate + `${month}/${year}`, this.httpOptions()).pipe(
        tap((data) => this.setCachedData(cacheKey, data))
      )
    }
  }

  getFindingUnfinishedById(taskId: number) {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.findingUnfinished + `${taskId}`, this.httpOptions())
  }

  getFindingChecklist() {
    const cacheKey = "checklistData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.checklistArea, this.httpOptions()).pipe(
        tap((data) => {
          this.setCachedData(cacheKey, data)
        })
      )
    }
  }

  // Checklist Count API

  getActivityChecklistByDate(month: number, year: number) {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.checklistAreaDate + `${month}/${year}`, this.httpOptions())
  }

  getActivityChecklistById(areaId: number, month: number, year: number) {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.checklistArea + `${areaId}/${month}/${year}`, this.httpOptions())
  }

  getChecklistCategoryByDate(month: number, year: number) {
    const cacheKey = "categoryDateData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.checklistCategory + `${month}/${year}`, this.httpOptions()).pipe(
        tap((data) => this.setCachedData(cacheKey, data))
      )
    }
  }

  getPeriodChecklistByDate(month: number, year: number) {
    const cacheKey = "periodData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.taskActivityId + `period/${year}/${month}`).pipe(
        tap((data) => this.setCachedData(cacheKey, data))
      )
    }
  }

  // Users API

  getUsers() {
    const cacheKey = "userData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.users, this.httpOptions()).pipe(
        tap((data) => this.setCachedData(cacheKey, data))
      )
    }
  }

  insertUser(userData: any) {
    return this.http.post(GlobalComponent.API_URL + GlobalComponent.users, {form_data: userData}, this.httpOptions()).pipe(
      tap(() => this.resetCachedData())
    )
  }

  updateUser(userId: number, userData: any) {
    return this.http.put(GlobalComponent.API_URL + GlobalComponent.users + `${userId}`, {form_data: userData}, this.httpOptions()).pipe(
      tap(() => this.resetCachedData())
    )
  }

  deleteUser(userId: number) {
    return this.http.delete(GlobalComponent.API_URL + GlobalComponent.users + `${userId}`, this.httpOptions()).pipe(
      tap(() => this.resetCachedData())
    )
  }

  uploadUserImage(file: FormData) {
    return this.http.post(GlobalComponent.API_URL + GlobalComponent.upload + `user`, file)
  }

  getRolesData() {
    const cacheKey = "roleData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + GlobalComponent.users + `roles`, this.httpOptions()).pipe(
        tap((data) => this.setCachedData(cacheKey, data))
      )
    }
  }

  isUserExists(nik: any) {
    return this.http.get(GlobalComponent.API_URL + GlobalComponent.users + `is-exists/${nik}`, this.httpOptions())
  }
  
  getEmployeeData(searchQuery: string) {
    if (searchQuery === '') {
      return of([])
    }

    return this.http.post(GlobalComponent.AIO_API + "employee", {search: searchQuery}, this.httpOptions()).pipe(
      map((response: any) => Array.isArray(response.data) ? response.data.filter((data: any) => new RegExp(searchQuery, 'mi').test(`${data.nik} - ${data.employee_name}`)).slice(0, 10) : [])
    )
  }

  // New Dashboard API
  getDashboardTaskCountByDate(month: number, year: number) {
    return this.http.get(GlobalComponent.API_URL + `master/task/count/${month}/${year}`, this.httpOptions())
  }

  getDashboardTaskByDateRange(fromDate: string, toDate: string) {
    const cacheKey = 'taskDateData'
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    }
    return this.http.get(GlobalComponent.API_URL + `master/task/date`, {params: { from: fromDate, to: toDate }}).pipe(
      tap((data) => this.setCachedData(cacheKey, data))
    )
  }

  getDashboardUnfinishedByDateRange(fromDate: string, toDate: string) {
    const cacheKey = 'unfinishedDateData'
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    }
    return this.http.get(GlobalComponent.API_URL + `master/finding/undone/date`, {params: { from: fromDate, to: toDate }}).pipe(
      tap((data) => this.setCachedData(cacheKey, data))
    )
  }

  getDashboardFindingByDateRange(fromDate: string, toDate: string) {
    const cacheKey = 'findingDateData'
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    }
    return this.http.get(GlobalComponent.API_URL + `master/finding/not-ok/date`, {params: { from: fromDate, to: toDate }}).pipe(
      tap((data) => this.setCachedData(cacheKey, data))
    )
  }

  getDashboardChecklistCategoryByDateRange(fromDate: string, toDate: string) {
    const cacheKey = 'categoryDateData'
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    }
    return this.http.get(GlobalComponent.API_URL + `master/checklist/category/date`, {params: { from: fromDate, to: toDate }}).pipe(
      tap((data) => this.setCachedData(cacheKey, data))
    )
  }

  getDashboardChecklistAreaByDateRange(areaId: number, fromDate: string, toDate: string) {
    return this.http.get(GlobalComponent.API_URL + `master/checklist/area/${areaId}`, {params: { from: fromDate, to: toDate }})
  }

  getDashboardPeriodCountByDateRange(fromDate: string, toDate: string) {
    const cacheKey = "periodData"
    if (this.isCachedDataExists(cacheKey)) {
      return of(this.getCachedData(cacheKey))
    } else {
      return this.http.get(GlobalComponent.API_URL + `master/task-activity/period`, {params: { from: fromDate, to: toDate }}).pipe(
        tap((data) => this.setCachedData(cacheKey, data))
      )
    }
    
  }



}
