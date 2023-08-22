import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, tap } from "rxjs";
import { GlobalComponent } from "../../global-component";

@Injectable({
  providedIn: "root",
})
export class restApiService {
  public httpOptions(): any {
    let token = localStorage.getItem("token");
    return {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        // "Authorization": `${token}`,
      }),
    };
  }

  constructor(private http: HttpClient) {}

  cachedActorData: any;

  removeImage(image: string) {
    return this.http.delete(GlobalComponent.API_URL + `master/` + GlobalComponent.image + image, this.httpOptions())
  }

  getImage(image: string) {
    return this.http.get(
      GlobalComponent.API_URL + GlobalComponent.image + image,
      this.httpOptions()
    )
  }

  getActorData(): Observable<any> {
    if (this.cachedActorData !== undefined) {
      return of(this.cachedActorData);
    } else {
      return this.http
        .get(
          GlobalComponent.API_URL + GlobalComponent.actor,
          this.httpOptions()
        )
        .pipe(
          tap((data) => {
            this.cachedActorData = data;
          })
        );
    }
  }

  getActorDataById(id: number): Observable<any> {
    return this.http.get(
      GlobalComponent.API_URL + GlobalComponent.actorId + id,
      this.httpOptions()
    );
  }

  postActorData(actorData: any): Observable<any> {
    return this.http
      .post(
        GlobalComponent.API_URL + GlobalComponent.actor,
        { form_data: actorData },
        this.httpOptions()
      )
      // .pipe(
      //   tap((res: any) => {
      //     this.cachedActorData.data.push({
      //       actor_id: res.data[0],
      //       first_name: actorData.first_name,
      //       last_name: actorData.last_name,
      //     });
      //   })
      // );
  }

  putActorData(id: number, actorData: any): Observable<any> {
    return this.http
      .put(
        GlobalComponent.API_URL + GlobalComponent.actorId + id,
        { form_data: actorData },
        this.httpOptions()
      )
      // .pipe(
      //   tap(() => {
      //     const dataIndex = this.cachedActorData.data.findIndex(
      //       (actor: any) => actor.actor_id === id
      //     );
      //     if (dataIndex !== -1) {
      //       this.cachedActorData.data[dataIndex] = {
      //         actor_id: id,
      //         first_name: actorData.first_name,
      //         last_name: actorData.last_name,
      //       };
      //     }
      //   })
      // );
  }

  deleteActorData(id: number): Observable<any> {
    return this.http
    .delete(
      GlobalComponent.API_URL + GlobalComponent.actorId + id,
      this.httpOptions()
    )
    .pipe(
      tap(() => {
        const dataIndex = this.cachedActorData.data.findIndex(
          (actor: any) => actor.actor_id === id
        );
        if (dataIndex !== -1) {
          this.cachedActorData.data.splice(dataIndex, 1);
        }
      })
    )
  }
}
