import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Comment } from 'src/app/shared/models/post.model';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent {

  @Input() comments: Comment[] = [];

  constructor(private modalCtrl: ModalController) { }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onClose() {
    this.modalCtrl.dismiss({ message: 'Fechando modal' }, 'confirm');
  }
}
