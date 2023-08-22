import { Component } from "@angular/core";
import { ActorData } from "./actor.model";
import { restApiService } from "src/app/core/services/rest-api.service";
import { ActivatedRoute, Router } from "@angular/router";

import Swal from "sweetalert2";
import { GlobalComponent } from "src/app/global-component";

@Component({
  selector: "app-actor",
  templateUrl: "./actor.component.html",
  styleUrls: ["./actor.component.scss"],
})
export class ActorComponent {
  tableColumn = ["No", "Image", "First Name", "Last Name", "Action"];
  actorData: any;
  index: number = 0;
  activePages: number[] = [];
  filteredActorData: ActorData[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages!: number;
  paginatedActorData: ActorData[] = [];
  pages: number[] = [];

  searchKeyword: string = "";
  successMessage: string = "";
  isSuccess: boolean = false;

  userImage: string = `${GlobalComponent.API_URL}${GlobalComponent.image}`

  constructor(
    private apiService: restApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params.success === "true") {
        this.successMessage = "Data has been updated!";
        this.isSuccess = true;
      }
    });
    this.getActorData();
  }

  onDelete(actorId: number): void {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(3, 142, 220)",
      cancelButtonColor: "rgb(243, 78, 78)",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.value) {
        const deleteData = { status: 0 };
        this.apiService
          .putActorData(actorId, deleteData)
          .subscribe((res: any) => {
            if (res.data == 1) {
              this.apiService.cachedActorData = undefined;
              this.getActorData();
              Swal.fire({
                title: "Deleted!",
                text: "User has been deleted.",
                confirmButtonColor: "rgb(3, 142, 220)",
                icon: "success",
              });
            }
          });
      }
    });
  }

  onEdit(actor: ActorData): void {
    this.router.navigate([`/user/edit`, actor.actor_id], {
      queryParams: {
        id: actor.actor_id,
        fName: actor.first_name,
        lName: actor.last_name,
      },
    });
  }

  getActorData() {
    this.apiService.getActorData().subscribe(
      (res: any) => {
        this.actorData = res.data;
        this.totalPages = Math.ceil(this.actorData.length / this.pageSize);
        this.updatePagination(this.actorData);
      },
      (error: any) => {
        console.error(`Failed to get actor data: ${error.error}`);
      }
    );
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.actorData);
    }
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedActorData = dataSource.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.activePages = this.calculateActivePages();
  }

  calculateActivePages(): number[] {
    const visiblePages = 5; // Number of visible pages
    const activePages: number[] = [];

    const startPage = Math.max(
      1,
      this.currentPage - Math.floor(visiblePages / 2)
    );
    const endPage = Math.min(this.totalPages, startPage + visiblePages - 1);

    for (let page = startPage; page <= endPage; page++) {
      activePages.push(page);
    }

    return activePages;
  }

  getComputedRowNumber(index: number): number {
    return this.index + index + 1;
  }

  applyFilter(): void {
    this.currentPage = 1;
    const filteredActorData = this.actorData.filter(
      (actor: ActorData) =>
        actor.first_name
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        actor.last_name
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
    );
    this.totalPages = Math.ceil(filteredActorData.length / this.pageSize);
    this.updatePagination(filteredActorData);
  }
}
