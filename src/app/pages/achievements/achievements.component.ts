import { Component } from "@angular/core";
import { restApiService } from "src/app/core/services/rest-api.service";
import { ChartType } from "./achievements.model"

interface ChartData {
  rawData: any[],
  percentageData: number[],
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
  areaUndoneActivity: number = 0
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

  findingUndoneActivity: FindingData = {
    rawData: [],
    total: 0,
    limitData: []
  }

  findingNotOkActivity: FindingData = {
    rawData: [],
    total: 0,
    limitData: []
  }

  columnsFinding = ["Activity", "Comment", "Mahcine/Area", "PIC", "Picture"]
  columnsUndone = ["Category", "Activity", "Machine/Area"]

  checklistCategoryData: any

  month: number
  year: number

  constructor(private apiService: restApiService) {
    const today = new Date()
    this.month = today.getMonth() + 1
    this.year = today.getFullYear()
  }

  onChangeDate() {
    this.apiService.resetCachedData()
    this.ngOnInit()
  }

  async ngOnInit() {
    await this.getTaskDataByDate(this.month, this.year)
    await this.getFindingUndoneByDate(this.month, this.year)
    await this.getFindingNotOkByDate(this.month, this.year)
    await this.getChecklistCategoryByDate(this.month, this.year)
    await this.getTaskAreaActivityById(this.taskActivityChartData.rawData[0].area, this.taskActivityChartData.rawData[0].task_id)
    this._taskActivityChart(
      '["--vz-success", "--vz-info", "--vz-warning", "--vz-danger", "--vz-secondary", "--vz-primary", "--vz-dark"]'
    );
  }

  async getTaskDataByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.apiService.getTaskDataByDate(month, year).subscribe({
        next: (res: any) => {
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
          console.log(this.taskActivityChartData)
          console.log(this.totalActivity)
          resolve(1)
        },
        error: (err: any) => {
          reject(err)
          console.error(err);
        },
        complete: () => {}
      });
    })
  }

  async getFindingUndoneByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.apiService.getFindingUndoneByDate(month, year).subscribe({
        next: (res: any) => {
          if (this.findingUndoneActivity.rawData.length > 0) {
            this.findingUndoneActivity.rawData.splice(0)
            this.findingUndoneActivity.total = 0
            this.findingUndoneActivity.limitData.splice(0)
          }
          let data: any[] = res.data
          let dataUndone = [...data]
          this.findingUndoneActivity.rawData = data
          this.findingUndoneActivity.total = data.length
          this.findingUndoneActivity.limitData = this.getRandomIndices(dataUndone.length, 5).map(index => dataUndone[index]);
          console.log(this.findingUndoneActivity)
          resolve(1)
        },
        error: (err: any) => {
          console.error(err)
          reject(err)
        }
      })
    })
  
  }
  async getFindingNotOkByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.apiService.getFindingNotOkByDate(month, year).subscribe({
        next: (res: any) => {
          let data: any[] = res.data
          this.findingNotOkActivity.rawData = data
          this.findingNotOkActivity.total = data.length
          let findingData = [...data]
          this.findingNotOkActivity.limitData = findingData.slice(-4).sort((a, b) => findingData.indexOf(b) - findingData.indexOf(a))

          console.log(this.findingNotOkActivity)
          resolve(1)
        },
        error: (err: any) => {
          console.error(err)
          reject(err)
        }
      })
    })
  }

  async getChecklistCategoryByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.apiService.getChecklistCategoryByDate(month, year).subscribe({
        next: (res: any) => {
          this.checklistCategoryData = res.data
          resolve(1)
        },
        error: (err: any) => {
          console.error(err)
          reject(err)
        }
      })
    })
  }

  async getTaskAreaActivityById(area: string, taskId: number) {
    return new Promise((resolve, reject) => {
      this.areaTitle = area
      if (this.taskAreaActivityChartData.rawData.length < 1) {
        this._taskAreaActivityChart('["--vz-info", "--vz-success"]')
        this._taskAreaComparisonChart('["--vz-primary", "--vz-info"]');
      }
      this.apiService.getActivityChecklistById(taskId).subscribe({
        next: (res: any) => {
          let data: any[] = res.data
          this.taskAreaActivityChartData.rawData = data
          this.taskAreaActivityChartData.percentageData.splice(0)
          this.taskAreaActivityChartData.checklistData?.splice(0)
          this.taskAreaActivityChartData.totalActivityData?.splice(0)
          this.taskAreaActivityChartData.categories.splice(0)
          data.forEach((task) => {
            this.taskAreaActivityChartData.categories.push(task.machine_area)
            this.taskAreaActivityChartData.percentageData.push(this.getActivityPercentage(task.total_activity, task.checklist))
            this.taskAreaActivityChartData.checklistData?.push(task.checklist)
            this.taskAreaActivityChartData.totalActivityData?.push(task.total_activity)
          })
          console.log(this.taskAreaActivityChartData)
        },
        error: (err: any) => {
          console.error(err)
          reject(err)
        },
        complete: () => {
          this.setTaskAreaChartValue()
          this.setTaskAreaComparisonChartValue()
          this.setTaskAreaSummary(taskId)
          resolve(1)
        }
      })
    })
    
  }

  setTaskAreaSummary(taskId: number) {
    const dataPercentage = (percentageData: any[]) => {
      let totalChecklist = percentageData.reduce((total, item) => total + item.checklist , 0)
      let totalActivity = dataTotalActivity(this.taskAreaActivityChartData.totalActivityData!)
      let areaPercentage = this.getActivityPercentage(totalActivity, totalChecklist)
      return areaPercentage
    }
    const dataTotalActivity = (totalActivityData: any[]) => {
      let totalActivity = totalActivityData.reduce((total, item) => total + item, 0)
      return totalActivity as number
    }
    this.areaAchievements = dataPercentage(this.taskAreaActivityChartData.rawData)
    this.areaTotalActivity = dataTotalActivity(this.taskAreaActivityChartData.totalActivityData!)
    this.areaUndoneActivity = this.findingUndoneActivity.rawData.filter(data => data.task_id === taskId).length
    this.areaTotalFinding = this.findingNotOkActivity.rawData.filter(data => data.task_id === taskId).length

    console.log(`areaAchievements: ${this.areaAchievements}, areaTotalActivity: ${this.areaTotalActivity}, areaUndoneActivity: ${this.areaUndoneActivity}, areaTotalFinding: ${this.areaTotalFinding}`)
  }

  setTaskAreaComparisonChartValue() {
    this.taskAreaComparisonChart.series = [
      { data: this.taskAreaActivityChartData.totalActivityData } ,
      { data: this.taskAreaActivityChartData.checklistData }
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
          data: this.taskAreaActivityChartData.totalActivityData,
        },
        {
          data: this.taskAreaActivityChartData.checklistData,
        },
      ],
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
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
              const taskId = taskActivityChartData.rawData[config.dataPointIndex].task_id
              getTaskAreaActivityById(area, taskId)
              window.scrollTo(0, 585);
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
        height: 356,
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
          colors: ["#fff"],
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
          show: false
        },
      },
      title: {
        text: this.areaTitle,
        align: "center",
        floating: true,
        style: {
          fontWeight: 600,
        },
      },
      tooltip: {
        x: {
          show: true,
        },
        y: {
          title: {
            formatter: function (val: any, opt: any) {
              console.log("clicked: " + taskAreaActivityChartData.rawData[opt.dataPointIndex].machine_area)
              const checklist = taskAreaActivityChartData.rawData[opt.dataPointIndex].checklist
              const totalActivity = taskAreaActivityChartData.rawData[opt.dataPointIndex].total_activity
              return "Checklist: " + `${checklist}/${totalActivity}`;
            },
          },
        },
      },
    };
  }

  getActivityPercentage(totalActivity: number, totalChecklist: number): number {
    let result = Math.floor((totalChecklist / totalActivity) * 100);
    if (isNaN(result)) result = 0
    return result
  }

  getPercentageBadge(percentage: number): string {
    switch (true) {
      case percentage < 35:
        return 'danger';
      case percentage < 70:
        return 'warning';
      case percentage < 100:
        return 'success';
      case percentage === 100:
        return 'secondary';
      default:
        return 'primary';
    }
  }

  getCategoryBadge(category: any): string {
    switch (true) {
      case category == 'Cleaning':
        return 'primary';
      case category == 'Inspecting':
        return 'secondary';
      case category == 'Lubricating':
        return 'info';
      case category == 'Tightening':
        return 'success';
      default :
        return 'dark';
    }
  }

  getRandomIndices(max: number, count: number): number[] {
    const indices: any[] = [];
    while (indices.length < count) {
        const randomIndex = Math.floor(Math.random() * max);
        if (!indices.includes(randomIndex)) {
            indices.push(randomIndex);
        }
    }
    return indices;
  }

  getMonthName(month: number): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    return monthNames[month - 1];
  }
}
