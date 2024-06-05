import { Component, Input, ViewChild } from '@angular/core';
import { AlertController, IonTextarea, LoadingController, ModalController } from '@ionic/angular';
import { CommentData } from 'src/app/shared/models/post.model';
import { PostService } from 'src/app/shared/services/post.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent {


  @Input() data!: CommentData;
  @ViewChild('comments') comments!: IonTextarea;
  comment: string = '';

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private postService: PostService
  ) { }

  ionViewDidEnter(){
    this.comments.setFocus();
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  onClose() {
    this.modalCtrl.dismiss();
  }

  onComment(): void {
    if (this.comment != "") {
      const values = {
        user_id: this.data.user_id,
        post_id: this.data.post_id,
        text: this.comment
      };

      this.loadingCtrl.create({
        message: "publicando comentário..."
      })
        .then(loadingEl => {
          loadingEl.present();
          this.postService.newComment(values).subscribe({
            next: () => {
              loadingEl.dismiss();
              this.modalCtrl.dismiss({ newComment: values });
            },
            error: (err) => {
              console.error("Erro ao publicar comentário: \n", err);
              this.alertCtrl.create({
                header: "Erro ao publicar comentário!",
                message: err.error.message,
                buttons: ['Tente novamente']
              })
                .then(alertEl => {
                  loadingEl.dismiss();
                  alertEl.present();
                })
            }
          })
        })
    }
  }
}
