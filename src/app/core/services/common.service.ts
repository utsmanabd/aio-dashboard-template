import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { Const } from '../static/const';

@Injectable({
  providedIn: 'root'
})

export class CommonService {


  constructor() { }

  // -- Table Numbers
  getComputedRowNumber(globalIndex: number, index: number): number {
    return globalIndex + index + 1;
  }

  // -- Pagination
  calculateActivePages(currentPage: number, totalPages: number): number[] {
    const visiblePages = 5;
    const activePages: number[] = [];

    const startPage = Math.max(
      1,
      currentPage - Math.floor(visiblePages / 2)
    );
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    for (let page = startPage; page <= endPage; page++) {
      activePages.push(page);
    }

    return activePages;
  }

  // -- Document manipulations
  scrollToElement(element: any): void {
    element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

  goToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  // -- File Handler
  renameFile(file: File, newFileName: string): File {
    const renamedFile = new File([file], newFileName, { type: file.type });
    return renamedFile;
  }

  // -- Date
  getDate(timestamp: any): string {
    let date = new Date(timestamp).toLocaleDateString()
    return date
  }

  getMonthName(month: number): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    return monthNames[month - 1];
  }

  // -- HTML class manipulations
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

  // -- Math Functions
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

  getTaskPercentage(totalActivity: number, totalChecklist: number): number {
    let result = Math.floor((totalChecklist / totalActivity) * 100);
    if (isNaN(result)) result = 0
    return result
  }

  // -- Alerts
  showSuccessAlert(message?: string, cancelMessage?: string) {
    return Swal.fire({
      title: 'Success!',
      text: message ? message : 'Great job!',
      icon: 'success',
      showCancelButton: cancelMessage ? true : false,
      cancelButtonColor: 'rgb(240, 101, 72)',
      confirmButtonText: 'OK',
      cancelButtonText: cancelMessage ? cancelMessage : 'Cancel'
    })
  }

  showServerErrorAlert(message: string = Const.ERR_SERVER_MSG, title: string = Const.ERR_SERVER_TITLE) {
    return this.showErrorAlert(message, title, 'Retry').then((result) => {
      if (result.value) location.reload()
    })
  }

  showErrorAlert(message?: string, title?: string, confirmButton?: string) {
    return Swal.fire({
      title: title ? title : 'Not Found',
      text: message ? message : 'Something went wrong',
      icon: 'error',
      showCloseButton: true,
      confirmButtonText: confirmButton ? confirmButton : 'Close'
    })
  }

  showDeleteWarningAlert(message?: string) {
    return Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "rgb(243, 78, 78)",
      confirmButtonText: "Delete",
    })
  }

}
