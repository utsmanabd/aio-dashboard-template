import { Component } from '@angular/core';
import { restApiService } from 'src/app/core/services/rest-api.service';

@Component({
  selector: 'app-film',
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.scss']
})
export class FilmComponent {
  selectedFiles: File[] = [];
  imageUrl: any

  constructor(private apiService: restApiService) {}

  ngOnDestroy() {
    this.selectedFiles = [];
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFiles.push(file);
  }

  onSubmit() {
    if (this.selectedFiles.length > 0) {
      const formData = new FormData();

      this.selectedFiles.forEach(file => {
        formData.append('files', file, file.name);
      });
      
      this.apiService.uploadMultipleImage(formData).subscribe({
        next: (res: any) => {
          console.log(res)
          this.imageUrl = res.uploadedFiles
        },
        error: (err) => console.error(err),
        complete: () => this.selectedFiles = []
      })
    }
  }
}
