import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Post } from 'src/app/shared/models/post.model';
import { PostService } from 'src/app/shared/services/post.service';

import { PostDetailComponent } from './post-detail/post-detail.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public postList$ = new BehaviorSubject<Post[]>([]);
  isLoading: boolean = false;
  limitCard: number = 85;

  constructor(
    private postService: PostService,
    private modalCtrl: ModalController
  ) { }

  async ngOnInit() {
    this.isLoading = true;
    await this.getPostList();
  }

  async getPostList() {
    try {
      await this.postService.getGeolocation();
      const posts = await lastValueFrom(this.postService.getPosts());
      this.postList$.next(posts);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      this.isLoading = false;
    }
  }


  handleRefresh(event: { target: { complete: () => void; }; }) {
    this.isLoading = true;
    setTimeout(async () => {
      await this.getPostList()
      event.target.complete();
      this.isLoading = false;
    }, 1000);
  }

  async openModalComments(id: number) {
    this.postList$.getValue().forEach(async p => {
      if (p.id === id) {
        const data = {
          post_id: p.id,
          user_id: p.user_id,
          comments: p.comments
        }
        await this.modalCtrl.create({
          component: PostDetailComponent,
          componentProps: {
            data: data
          }
        })
        .then(modalEl => {
          modalEl.present();
          return modalEl.onDidDismiss();
        })
        .then(data => {
          this.getPostList();
        })
      }
    })

  }

  protected postLike(id: number) {
    this.postService.setPostLike(id).subscribe({
      next: () => {
        const updatedPosts = this.postList$.getValue().map(post => {
          if (post.id === id) {
            return {
              ...post,
              like: !post.like
            };
          }
          return post;
        });

        this.postList$.next(updatedPosts);
      },
      error: (err) => {
        console.error("Error: ", err);
      }
    });
  }

}
