import { Component, OnInit } from '@angular/core';
import { ModalController, SegmentChangeEventDetail } from '@ionic/angular';
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
  isRefreshing: boolean = false;
  limitCard: number = 85;
  localPosts: boolean = true;
  collapseState: { [key: number]: boolean } = {};

  constructor(
    private postService: PostService,
    private modalCtrl: ModalController
  ) { }

  async ngOnInit() {
    this.isLoading = true;
    await this.getLocalPostList();
  }

  async onSelectPostLocation(event: CustomEvent<SegmentChangeEventDetail>) {
    this.localPosts = !this.localPosts;
    this.localPosts ? await this.getLocalPostList() : this.getAllPosts();
  }

  getAllPosts() {
    this.postService.getAllPosts().subscribe({
      next: (res) => {
        this.postList$.next(res);
        this.initializeCollapseState(res);
      },
      error: (err) => {
        console.error("Error fetching posts: \n", err);
      },
      complete: () => {
        this.isLoading = false;
      }
    })
  }

  async getLocalPostList() {
    try {
      await this.postService.getGeolocation();
      const posts = await lastValueFrom(this.postService.getLocalPosts());
      this.initializeCollapseState(posts);
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
      this.localPosts ? await this.getLocalPostList() : this.getAllPosts();
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
        .then(async data => {
          this.localPosts ? await this.getLocalPostList() : this.getAllPosts();
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
              like: !post.like,
              reactions: {
                ...post.reactions,
                quantidadeLike: post.like ? post.reactions.quantidadeLike - 1 : post.reactions.quantidadeLike + 1
              }
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


  setIcon(type: string) {
    if (type === "alerta") {
      return { name: "warning-outline", color: "warning" };
    } else if (type === "critica") {
      return { name: "alert-circle-outline", color: "danger" };
    } else if (type === "elogio") {
      return { name: "trophy-outline", color: "success" };
    } else {
      return { name: "help-outline", color: "medium" };
    }
  }

  collapseDescription(post: Post) {
    const isCollapsed = this.collapseState[post.id];
    if (post.text.length > 80 && isCollapsed) {
      return post.text.slice(0, 80) + "...";
    }
    return post.text;
  }

  toggleCollapse(postId: number) {
    this.collapseState[postId] = !this.collapseState[postId];
  }

  initializeCollapseState(posts: Post[]) {
    posts.forEach(post => {
      this.collapseState[post.id] = true; 
    });
  }
}
