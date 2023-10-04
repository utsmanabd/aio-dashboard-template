import { Component } from '@angular/core';
import { restApiService } from 'src/app/core/services/rest-api.service';

@Component({
  selector: 'app-finding',
  templateUrl: './finding.component.html',
  styleUrls: ['./finding.component.scss']
})
export class FindingComponent {

  columnsFinding = ["Activity", "Comment", "Mahcine/Area", "PIC", "Picture"]
  findingData: any[] = [];

  constructor(private apiService: restApiService) {}

  ngOnInit(): void {
    this.getFindingData()
  }

  getFindingData() {
    this.apiService.getFindingNotOk().subscribe({
      next: (res: any) => {
        this.findingData = res.data;
      },
      error: (err: any) => {
        console.error(err);
      }
    })
  }
}
