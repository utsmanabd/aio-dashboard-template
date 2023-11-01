import { Component } from '@angular/core';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { GlobalComponent } from 'src/app/global-component';

@Component({
  selector: 'app-finding',
  templateUrl: './finding.component.html',
  styleUrls: ['./finding.component.scss']
})
export class FindingComponent {

  columnsFinding = ["Activity", "Comment", "Mahcine/Area", "PIC", "Picture"]
  findingData: any[] = [];

  imageUrl = GlobalComponent.API_URL + GlobalComponent.image
  isLoading: boolean = false;
  breadCrumbItems!: Array<{}>;

  constructor(private apiService: restApiService) {
    this.breadCrumbItems = [
      { label: 'Planner' },
      { label: 'Finding', active: true }
    ];
  }

  ngOnInit(): void {
    this.getFindingData()
  }

  getFindingData() {
    this.isLoading = true
    this.apiService.getFindingNotOk().subscribe({
      next: (res: any) => {
        this.findingData = res.data;
        this.isLoading = false
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false
      }
    })
  }
}
