import { Component } from "@angular/core";
import { restApiService } from "src/app/core/services/rest-api.service";
import { ChartType } from "./achievements.model"
import { CommonService } from "src/app/core/services/common.service";
import { tap } from "rxjs";
import { Const } from "src/app/core/static/const";
import { GlobalComponent } from "src/app/global-component";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { TokenStorageService } from "src/app/core/services/token-storage.service";

interface ChartData {
  rawData: any[],
  percentageData?: number[],
  checklistData?: any[],
  totalActivityData?: any[],
  categories: string[],
}

interface FindingData {
  rawData: any[],
  total: number,
  limitData: any[],
  
}

@Component({
  selector: "app-achievements",
  templateUrl: "./achievements.component.html",
  styleUrls: ["./achievements.component.scss"],
})
export class AchievementsComponent {
  countFrom = 0

  totalActivity!: number
  areaTitle!: string

  areaAchievements: number = 0
  areaTotalActivity: number = 0
  areaUnfinishedActivity: number = 0
  areaTotalFinding: number = 0

  taskActivityChart!: ChartType;
  taskActivityChartData: ChartData = {
    rawData: [],
    percentageData: [],
    checklistData: [],
    categories: []
  }

  taskAreaActivityChart!: ChartType;
  taskAreaComparisonChart!: ChartType;
  taskAreaActivityChartData: ChartData = {
    rawData: [],
    percentageData: [],
    checklistData: [],
    totalActivityData: [],
    categories: []
  }

  periodComparisonChart!: ChartType;
  periodComparisonChartData: ChartData = {
    rawData: [],
    checklistData: [],
    totalActivityData: [],
    categories: []
  }

  findingUnfinishedActivity: FindingData = {
    rawData: [],
    total: 0,
    limitData: []
  }

  findingNotOkActivity: FindingData = {
    rawData: [],
    total: 0,
    limitData: []
  }

  todayActivity: any

  columnsFinding = ["Activity / Standard", "Comment", "Mahcine / Area", "PIC", "Picture"]
  columnsUnfinished = ["Category", "Activity", "Machine/Area"]

  imageUrl = GlobalComponent.API_URL + GlobalComponent.image

  checklistCategoryData: any

  month: number
  monthBefore!: number
  year: number
  yearBefore!: number

  isLoading: boolean = false
  isSmallScreen: boolean = false
  
  userData: any

  constructor(
    private apiService: restApiService, 
    public common: CommonService, 
    private breakpointObserver: BreakpointObserver,
    private tokenService: TokenStorageService
  ) {
    const today = new Date()
    this.month = today.getMonth() + 1
    this.year = today.getFullYear()

    this.breakpointObserver.observe([Breakpoints.XSmall]).subscribe(result => {
      this.isSmallScreen = result.breakpoints[Breakpoints.XSmall]
    })
  }

  onChangeDate() {
    if (this.monthBefore !== this.month || this.yearBefore !== this.year) {
      this.apiService.resetCachedData()
      this.ngOnInit()
    }
  }

  ngOnDestroy() {
    const today = new Date()
    const month = today.getMonth() + 1
    if (this.month != month) {
      this.apiService.resetCachedData()
    }
  }

  async ngOnInit() {
    this.userData = this.tokenService.getUser()
    await this.getTaskActivityCountToday()
    await this.getTaskDataByDate(this.month, this.year).finally(() => this.isLoading = false)
    await this.getFindingUnfinishedByDate(this.month, this.year).finally(() => this.isLoading = false)
    await this.getFindingNotOkByDate(this.month, this.year).finally(() => this.isLoading = false)
    await this.getChecklistCategoryByDate(this.month, this.year).finally(() => this.isLoading = false)
    if (this.userData.area_id == -1) {
      await this.getTaskAreaActivityById(this.taskActivityChartData.rawData[0].area, this.taskActivityChartData.rawData[0].area_id)
    } else await this.getTaskAreaActivityById(this.userData.area, this.userData.area_id)
    await this.getPeriodCountByDate(this.month, this.year).finally(() => this.isLoading = false)
    this._taskActivityChart(
      '["--vz-success", "--vz-info", "--vz-warning", "--vz-danger", "--vz-secondary", "--vz-primary", "--vz-dark"]'
    );
    this._periodComparisonChart('["--vz-danger", "--vz-secondary"]');
    this.monthBefore = this.month
    this.yearBefore = this.year
  }

  async getTaskActivityCountToday() {
    return new Promise((resolve, reject) => {
      this.apiService.getCountTaskActivity().subscribe({
        next: (res: any) => {
          let taskData: any[] = []
          const todayFormatted = this.common.formatDate(new Date())
          const todayTask: any[] = res.data.filter((item: any) => this.common.formatDate(new Date(item.date)) == todayFormatted)
          
          if (this.userData.area_id != -1) {
            const taskWith3DaysSet: any[] = res.data.filter((item: any) => item.is_three_days === 1 && item.area_id == this.userData.area_id)
            const date = (date: Date | string | number) => this.common.formatDate(new Date(date))
            
            if (todayTask.length == 0 && taskWith3DaysSet.length > 0) {
              const today = new Date()

              let dateOn3DaysAgo = date(today.setDate(today.getDate() - 2))
              let dateOn2DaysAgo = date(today.setDate(today.getDate() + 1))
              let dateOnYesterday = date(today.setDate(today.getDate() + 1))

              const taskFromThreeDaysAgo = taskWith3DaysSet.filter((item) => date(item.date) == dateOn3DaysAgo)
              const taskFromTwoDaysAgo = taskWith3DaysSet.filter((item) => date(item.date) == dateOn2DaysAgo)
              const taskFromYesterday = taskWith3DaysSet.filter((item) => date(item.date) == dateOnYesterday)
        
              if (taskFromThreeDaysAgo.length > 0) {
                taskFromThreeDaysAgo.forEach(item => {
                  taskData.push(item)
                })
              }

              if (taskFromTwoDaysAgo.length > 0) {
                taskFromTwoDaysAgo.forEach(item => {
                  taskData.push(item)
                })
              }

              if (taskFromYesterday.length > 0) {
                taskFromYesterday.forEach(item => {
                  taskData.push(item)
                })
              }

            } else {
              taskData = todayTask.filter(item => item.area_id == this.userData.area_id)
            }

          } else taskData = todayTask

          const totalTask = taskData.length
          const totalActivity: number = taskData.reduce((total, item) => total + item.total_activity, 0)
          const totalChecklist: number = taskData.reduce((total, item) => total + item.checklist, 0)
          const unfinishedChecklist = totalActivity - totalChecklist

          this.todayActivity = {
            totalTask: totalTask,
            unfinishedChecklist: unfinishedChecklist,
          }

          resolve(true)
        },
        error: (err) => {
          reject(err);
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Task Count"), err)
        }
      })
    })
  }

  async getTaskDataByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.isLoading = true
      this.apiService.getTaskDataByDate(month, year).subscribe({
        next: (res: any) => {
          if (!res.status) {
            if (this.monthBefore && this.yearBefore) {
              this.month = this.monthBefore
              this.year = this.yearBefore
            }
            this.apiService.resetCachedData()
            this.common.showErrorAlert(`No data found on ${this.common.getMonthName(month)} ${year}`)
            this.isLoading = false
          } else {
            if (this.taskActivityChartData.rawData.length > 0) {
              this.taskActivityChartData.rawData.splice(0)
              this.taskActivityChartData.checklistData?.splice(0)
              this.taskActivityChartData.categories.splice(0)
            }
            let data: any[] = res.data
            this.totalActivity = data.reduce((total, current) => total + current.total_activity, 0);
            data.forEach((task) => {
              this.taskActivityChartData.rawData.push(task)
              this.taskActivityChartData.checklistData?.push(task.checklist)
              this.taskActivityChartData.categories.push(task.area)
            });
            resolve(true)
          }
          
        },
        error: (err) => {
          reject(err)
          this.common.showServerErrorAlert(Const.ERR_GET_MSG('Task'), err)
        },
      });
    })
  }

  async getFindingUnfinishedByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.isLoading = true
      this.apiService.getFindingUnfinishedByDate(month, year).subscribe({
        next: (res: any) => {

          if (this.findingUnfinishedActivity.rawData.length > 0) {
            this.apiService.resetCachedData("unfinishedDateData")
            this.findingUnfinishedActivity.rawData.splice(0)
            this.findingUnfinishedActivity.total = 0
            this.findingUnfinishedActivity.limitData.splice(0)
          }
          let data: any[] = []
          if (this.userData.area_id != -1) {
            data = res.data.filter((item: any) => item.area_id == this.userData.area_id)
          } else data = res.data

          let dataUnfinished = [...data]
          
          this.findingUnfinishedActivity.rawData = data
          this.findingUnfinishedActivity.total = data.length
          this.findingUnfinishedActivity.limitData = this.common.getRandomIndices(dataUnfinished.length, 5).map(index => dataUnfinished[index]);
          resolve(true)
        },
        error: (err: any) => {
          reject(err)
          this.common.showServerErrorAlert(Const.ERR_GET_MSG('Unfinished'), err)
        }
      })
    })
  
  }
  async getFindingNotOkByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.isLoading = true
      this.apiService.getFindingNotOkByDate(month, year).subscribe({
        next: (res: any) => {
          if (this.findingNotOkActivity.rawData.length > 0) {
            this.apiService.resetCachedData("findingDateData")
          }
          let data: any[] = res.data
          if (this.userData.area_id != -1) {
            this.findingNotOkActivity.rawData = data.filter(data => data.area_id == this.userData.area_id)
          } else {
            this.findingNotOkActivity.rawData = data
          }
          
          this.findingNotOkActivity.total = this.findingNotOkActivity.rawData.length
          let findingData = [...this.findingNotOkActivity.rawData]
          this.findingNotOkActivity.limitData = findingData.slice(-4).sort((a, b) => findingData.indexOf(b) - findingData.indexOf(a))
          resolve(true)
        },
        error: (err: any) => {
          reject(err)
          this.common.showServerErrorAlert(Const.ERR_GET_MSG('Finding'), err)
        }
      })
    })
  }

  async getChecklistCategoryByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.isLoading = true
      this.apiService.getChecklistCategoryByDate(month, year).subscribe({
        next: (res: any) => {
          if (this.checklistCategoryData) {
            this.apiService.resetCachedData("categoryDateData")
          }
          this.checklistCategoryData = res.data
          resolve(true)
        },
        error: (err: any) => {
          reject(err)
          this.common.showServerErrorAlert(Const.ERR_GET_MSG('Checklist Category'), err)
        }
      })
    })
  }

  async getTaskAreaActivityById(area: string, areaId: number) {
    return new Promise((resolve, reject) => {
      this.areaTitle = area
      if (this.taskAreaActivityChartData.rawData.length < 1) {
        this._taskAreaActivityChart('["--vz-info", "--vz-success"]')
        this._taskAreaComparisonChart('["--vz-primary", "--vz-info"]');
      }
      this.apiService.getActivityChecklistById(areaId, this.month, this.year).subscribe({
        next: (res: any) => {
          let data: any[] = res.data
          this.taskAreaActivityChartData.rawData = data
          this.taskAreaActivityChartData.percentageData?.splice(0)
          this.taskAreaActivityChartData.checklistData?.splice(0)
          this.taskAreaActivityChartData.totalActivityData?.splice(0)
          this.taskAreaActivityChartData.categories.splice(0)
          data.forEach((task) => {
            this.taskAreaActivityChartData.categories.push(task.machine_area)
            this.taskAreaActivityChartData.percentageData?.push(this.common.getTaskPercentage(task.total_activity, task.checklist))
            this.taskAreaActivityChartData.checklistData?.push(task.checklist)
            this.taskAreaActivityChartData.totalActivityData?.push(task.total_activity)
          })
        },
        error: (err: any) => {
          reject(err)
          this.common.showServerErrorAlert(Const.ERR_GET_MSG('Task Area'), err)
        },
        complete: () => {
          this.setTaskAreaChartValue()
          this.setTaskAreaComparisonChartValue()
          this.setTaskAreaSummary(areaId) // TODO
          resolve(true)
        }
      })
    })
    
  }

  async getPeriodCountByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.isLoading = true
      this.apiService.getPeriodChecklistByDate(month, year).subscribe({
        next: (res: any) => {
          let data: any[] = res.data
          this.periodComparisonChartData.rawData = data
          this.periodComparisonChartData.categories = data.map(item => item.periode)
          this.periodComparisonChartData.checklistData = data.map(item => item.checklist)
          this.periodComparisonChartData.totalActivityData = data.map(item => item.total_activity)
          resolve(true)
        },
        error: (err: any) => {
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Period Count"), err)
          reject(err)
        }
      })
    })
  }

  setTaskAreaSummary(areaId: number) {
    const dataPercentage = (percentageData: any[]) => {
      let totalChecklist = percentageData.reduce((total, item) => total + item.checklist , 0)
      let totalActivity = dataTotalActivity(this.taskAreaActivityChartData.totalActivityData!)
      let areaPercentage = this.common.getTaskPercentage(totalActivity, totalChecklist)
      return areaPercentage
    }
    const dataTotalActivity = (totalActivityData: any[]) => {
      let totalActivity = totalActivityData.reduce((total, item) => total + item, 0)
      return totalActivity as number
    }
    this.areaAchievements = dataPercentage(this.taskAreaActivityChartData.rawData)
    this.areaTotalActivity = dataTotalActivity(this.taskAreaActivityChartData.totalActivityData!)
    this.areaUnfinishedActivity = this.findingUnfinishedActivity.rawData.filter(data => data.area_id === areaId).length
    this.areaTotalFinding = this.findingNotOkActivity.rawData.filter(data => data.area_id === areaId).length
  }

  setTaskAreaComparisonChartValue() {
    this.taskAreaComparisonChart.series = [
      {
        name: "Total Activity" ,
        data: this.taskAreaActivityChartData.totalActivityData
      },
      {
        name: "Total Done",
        data: this.taskAreaActivityChartData.checklistData
      }
    ]
    this.taskAreaComparisonChart.xaxis = { categories: this.taskAreaActivityChartData.categories }
  }

  setTaskAreaChartValue() {
    this.taskAreaActivityChart.series = [{ data: this.taskAreaActivityChartData.percentageData }]
    this.taskAreaActivityChart.xaxis = { categories: this.taskAreaActivityChartData.categories }
    this.taskAreaActivityChart.title = {
      text: this.areaTitle,
      align: "center",
      floating: true,
      style: {
        fontWeight: 600,
      },
    }
  }

  scrollToElement(element: any): void {
    element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

  private getChartColorsArray(colors: any) {
    colors = JSON.parse(colors);
    return colors.map(function (value: any) {
      var newValue = value.replace(" ", "");
      if (newValue.indexOf(",") === -1) {
        var color = getComputedStyle(document.documentElement).getPropertyValue(
          newValue
        );
        if (color) {
          color = color.replace(" ", "");
          return color;
        } else return newValue;
      } else {
        var val = value.split(",");
        if (val.length == 2) {
          var rgbaColor = getComputedStyle(
            document.documentElement
          ).getPropertyValue(val[0]);
          rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  }

  private _taskAreaComparisonChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.taskAreaComparisonChart = {
      series: [
        {
          name: "Total Activity",
          data: this.taskAreaActivityChartData.totalActivityData,
        },
        {
          name: "Total Done",
          data: this.taskAreaActivityChartData.checklistData,
        },
      ],
      chart: {
        type: "bar",
        height: 362,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        style: {
          fontSize: "12px",
          colors: ["#304758"]
        },
        offsetY: -20,
        offsetX: 0,
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["#fff"],
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
      xaxis: {
        categories: this.taskAreaActivityChartData.categories,
      },
      colors: colors,
    };
  }

  private _taskActivityChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    const taskActivityChartData = this.taskActivityChartData
    const getTaskAreaActivityById = (area: string, taskId: number) => this.getTaskAreaActivityById(area, taskId)
    this.taskActivityChart = {
      series: [
        {
          data: this.taskActivityChartData.checklistData,
        },
      ],
      chart: {
        height: 356,
        type: "bar",
        toolbar: {
          show: false,
        },
        events: {
          click: function(event: any, chartContext: any, config: any) {
            const area = config.config.xaxis.categories[config.dataPointIndex]
            const index = config.dataPointIndex
            if (index !== -1 && area) {
              const areaId = taskActivityChartData.rawData[config.dataPointIndex].area_id
              getTaskAreaActivityById(area, areaId)
              window.scrollTo(0, 1150);
            }
          }
        }
      },
      plotOptions: {
        bar: {
          barHeight: "100%",
          distributed: true,
          // horizontal: true,
          dataLabels: {
            position: "top",
          },
        },
      },
      colors: colors,
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          colors: ["#304758"]
        },
        formatter: function (val:any, opt:any) {
          const checklist = taskActivityChartData.rawData[opt.dataPointIndex].checklist
          const totalActivity = taskActivityChartData.rawData[opt.dataPointIndex].total_activity
          return opt.w.globals.labels[opt.dataPointIndex] + `: ${checklist}/${totalActivity}`;
        },
        offsetY: -20,
        offsetX: 0,
        dropShadow: {
          enabled: false,
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      xaxis: {
        categories: this.taskActivityChartData.categories,
      },
      yaxis: {
        labels: {
          show: false,
          formatter: function(val: any) {
            return ``;
          }
          
        },
      },
      tooltip: {
        x: {
          show: true,
        },
        y: {
          title: {
            formatter: function (val: any, opt: any) {
              const checklist = taskActivityChartData.rawData[opt.dataPointIndex].checklist
              const totalActivity = taskActivityChartData.rawData[opt.dataPointIndex].total_activity
              return "Checklist: " + `${checklist}/${totalActivity}`;
            },
          },
        },
      },
    };
  }

  private _taskAreaActivityChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    const taskAreaActivityChartData = this.taskAreaActivityChartData
    this.taskAreaActivityChart = {
      series: [
        {
          data: this.taskAreaActivityChartData.percentageData,
        },
      ],
      chart: {
        height: 362,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "100%",
          distributed: true,
          dataLabels: {
            position: "bottom",
          },
        },
      },
      colors: colors,
      dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: {
          fontSize: "12px",
          colors: ["#304758"]
        },
        formatter: function (val:any, opt:any) {
          return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val + '%';
        },
        offsetX: 0,
        dropShadow: {
          enabled: false,
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      xaxis: {
        categories: this.taskAreaActivityChartData.categories,
      },
      yaxis: {
        labels: {
          show: false,
          formatter: function(val: any) {
            return `(${val}%)`;
          }
        },
      },
      tooltip: {
        x: {
          show: false,
        },
        y: {
          title: {
            formatter: function (val: any, opt: any) {
              const checklist = taskAreaActivityChartData.rawData[opt.dataPointIndex].checklist
              const totalActivity = taskAreaActivityChartData.rawData[opt.dataPointIndex].total_activity
              return "Total Done: " + `${checklist}/${totalActivity}`;
            },
          },
        },
      },
    };
  }

  private _periodComparisonChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.periodComparisonChart = {
      series: [
        {
          name: "Total Activity",
          data: this.periodComparisonChartData.totalActivityData,
        },
        {
          name: "Total Done",
          data: this.periodComparisonChartData.checklistData,
        },
      ],
      chart: {
        type: "bar",
        height: 362,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        style: {
          fontSize: "12px",
          colors: ["#304758"]
        },
        offsetY: -20,
        offsetX: 0,
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["#fff"],
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
      xaxis: {
        categories: this.periodComparisonChartData.categories,
      },
      colors: colors,
    };
  }

  getTotalAchievements(totalActivity: number, unfinished: number): number {
    let checklist = totalActivity - unfinished
    let result = this.common.getTaskPercentage(totalActivity, checklist)
    return result
  }
}
