import { Component, ElementRef, Renderer2, ViewChild } from "@angular/core";
import { restApiService } from "src/app/core/services/rest-api.service";
import { ChartType, TitleBox1Model } from "./achievements.model"

interface ChartData {
  rawData: any[];
  data: number[],
  categories: string[],
}

interface FindingData {
  total: number,
  data: any[]
}

@Component({
  selector: "app-achievements",
  templateUrl: "./achievements.component.html",
  styleUrls: ["./achievements.component.scss"],
})
export class AchievementsComponent {
  totalActivity!: number

  taskDataPercentage: ChartData = {
    rawData: [],
    data: [],
    categories: []
  }

  findingUndoneActivity: FindingData = {
    total: 0,
    data: []
  }

  columnsFinding = ["Activity", "Comment", "Mahcine/Area", "PIC", "Picture"]
  columnsUndone = ["Category", "Activity", "Machine/Area"]
  
  findingNotOkActivity: FindingData = {
    total: 0,
    data: []
  }

  checklistCategoryData: any

  groupedBarChart!: ChartType;
  customDataLabelsChart!: ChartType;
  columnWithDataChart!: ChartType;

  month: number = 9
  year: number = 2023

  @ViewChild('finding', { static: true }) private findingElement!: ElementRef;

  constructor(private apiService: restApiService, private renderer: Renderer2) {}

  async ngOnInit() {
    await this.getTaskDataByDate(this.month, this.year)
    await this.getFindingUndoneByDate(this.month, this.year)
    await this.getFindingNotOkByDate(this.month, this.year)
    await this.getChecklistCategoryByDate(this.month, this.year)
    this._groupedBarChart('["--vz-primary", "--vz-info"]');
    this._customDataLabelsChart(
      '["--vz-success", "--vz-info", "--vz-warning", "--vz-danger"]'
    );
    this._columnWithDataChart('["--vz-success"]');
  }

  async getTaskDataByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.apiService.getTaskDataByDate(month, year).subscribe({
        next: (res: any) => {
          let data: any[] = res.data
          this.totalActivity = data.reduce((total, current) => total + current.total_activity, 0);
          data.forEach((task) => {
            this.taskDataPercentage.rawData.push(task)
            this.taskDataPercentage.data.push(task.checklist)
            this.taskDataPercentage.categories.push(task.area)
          });
          console.log(this.taskDataPercentage)
          console.log(this.totalActivity)
          resolve(1)
        },
        error: (err: any) => {
          reject(err)
          console.error(err);
        }
      });
    })
  }

  async getFindingUndoneByDate(month: number, year: number) {
    return new Promise((resolve, reject) => {
      this.apiService.getFindingUndoneByDate(month, year).subscribe({
        next: (res: any) => {
          let data: any[] = res.data
          this.findingUndoneActivity.total = data.length
          let dataUndone = [...data]
          this.findingUndoneActivity.data = this.getRandomIndices(dataUndone.length, 5).map(index => dataUndone[index]);
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
          this.findingNotOkActivity.total = data.length
          let findingData = [...data]
          this.findingNotOkActivity.data = findingData.slice(-4).sort((a, b) => findingData.indexOf(b) - findingData.indexOf(a))
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

  private _groupedBarChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.groupedBarChart = {
      series: [
        {
          data: [44, 55, 41, 64, 22, 43, 21],
        },
        {
          data: [53, 32, 33, 52, 13, 44, 32],
        },
      ],
      chart: {
        type: "bar",
        height: 410,
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
        categories: [2001, 2002, 2003, 2004, 2005, 2006, 2007],
      },
      colors: colors,
    };
  }

  private _customDataLabelsChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    const taskDataPercentage = this.taskDataPercentage
    this.customDataLabelsChart = {
      series: [
        {
          data: this.taskDataPercentage.data,
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
        // textAnchor: "start",
        style: {
          fontSize: "12px",
          colors: ["#304758"]
        },
        // formatter: function(val: any) {
        //   return val + "%";
        // },
        formatter: function (val:any, opt:any) {
          const checklist = taskDataPercentage.rawData[opt.dataPointIndex].checklist
              const totalActivity = taskDataPercentage.rawData[opt.dataPointIndex].total_activity
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
        categories: this.taskDataPercentage.categories,
      },
      yaxis: {
        labels: {
          show: false,
          formatter: function(val: any) {
            return ``;
          }
          
        },
      },
      // title: {
      //   text: "Custom DataLabels",
      //   align: "center",
      //   floating: true,
      //   style: {
      //     fontWeight: 600,
      //   },
      // },
      // subtitle: {
      //   text: "Category Names as DataLabels inside bars",
      //   align: "center",
      // },
      tooltip: {
        // theme: "dark",
        x: {
          show: true,
        },
        y: {
          title: {
            formatter: function (val: any, opt: any) {
              console.log("clicked: " + taskDataPercentage.rawData[opt.dataPointIndex].task_id)
              const checklist = taskDataPercentage.rawData[opt.dataPointIndex].checklist
              const totalActivity = taskDataPercentage.rawData[opt.dataPointIndex].total_activity
              return "Checklist: " + `${checklist}/${totalActivity}`;
            },
          },
        },
      },
    };
  }

  private _columnWithDataChart(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.columnWithDataChart = {
      series: [
        {
          name: "Inflation",
          data: [2.3, 3.1, 4.0, 10.1]
        }
      ],
      chart: {
        height: 350,
        type: "bar"
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top" // top, center, bottom
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: any) {
          return val + "%";
        },
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"]
        }
      },
      colors: colors,
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr"
        ],
        position: "bottom",
        labels: {
          offsetY: -18
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        crosshairs: {
          fill: {
            type: "gradient",
            gradient: {
              colorFrom: "#D8E3F0",
              colorTo: "#BED1E6",
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5
            }
          }
        },
        tooltip: {
          enabled: true,
          offsetY: -35
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [50, 0, 100, 100]
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          show: false,
          formatter: function(val: any) {
            return val + "%";
          }
        }
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
}
