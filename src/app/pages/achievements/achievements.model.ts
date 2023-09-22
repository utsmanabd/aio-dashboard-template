// Chart data
export interface ChartType {
    chart?: any;
    plotOptions?: any;
    colors?: any;
    series?: any;
    fill?: any;
    dataLabels?: any;
    legend?: any;
    xaxis?: any;
    stroke?: any;
    labels?: any;
    markers?: any;
    yaxis?: any;
    tooltip?: any;
    subtitle?: any;
    grid?: any;
    title?: any;
    responsive?: any;
}

export interface TitleBox1Model {
    id?: any,
    label?: string,
    labelClass?: string,
    percentage?: string,
    percentageClass?: string,
    percentageIcon?: string,
    counter?: any,
    caption?: string,
    icon?: string,
    iconClass?: string,
    bgColor?: string;
    counterClass?: string,
    captionClass?: string,
    decimals: number,
    prefix?: string,
    suffix?: string,
  }