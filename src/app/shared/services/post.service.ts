import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { NewComment, NewPost, Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private readonly API = environment.API;
  userCity: string = "";

  constructor(private http: HttpClient) { }

  public getGeolocation() {
    return new Promise<void>((resolve, reject) => {
      Geolocation.getCurrentPosition().then(p => {
        this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.coords.latitude}&lon=${p.coords.longitude}&zoom=18&addressdetails=1`)
          .pipe(
            map((result) => result.address.city_district)
          )
          .subscribe({
            next: (res) => {
              this.userCity = res;
              resolve(res);
            },
            error: (err) => {
              reject(new Error("Error: " + err));
            }
          })
      })
    })
  }


  public getPosts(): Observable<Post[]> {
    console.log("Fetching posts for city: ", this.userCity);
    return this.http.get<Post[]>(`${this.API}/post/city/${this.userCity}`);
  }

  public setPostLike(postId: number): Observable<{user_id: number, post_id: number}> {
    return this.http.post<{user_id: number, post_id: number}>(`${this.API}/reaction/${postId}`, null)
  }

  public newPost(values: NewPost): Observable<NewPost> {
    return this.http.post<NewPost>(`${this.API}/post`, values);
  }

  public newComment(values: NewComment): Observable<void> {
    return this.http.post<void>(`${this.API}/comment`, values);
  }
}
