import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController, LoadingController, SegmentChangeEventDetail } from '@ionic/angular';
import * as L from 'leaflet';
import { PhotoService } from 'src/app/shared/services/photo.service';
import { PostService } from 'src/app/shared/services/post.service';

import { NewPost } from './../../../shared/models/post.model';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
})
export class NewPostPage implements AfterViewInit {

  imageUrl: any;
  selectedCategory: string = 'elogio';
  uploadedImages: any[] = [];

  map!: L.Map;
  customIcon!: L.Icon;  
  circle!: L.Circle;
  marker!: L.Marker;
  latLng!: L.LatLng;
  icon: string = "../../../../assets/localizador.png"
  form!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    protected photoService: PhotoService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private postService: PostService,
    private router: Router
  ) { 
    this.form = this.formBuilder.group({
      title: [null, [Validators.required]],
      description: [null, [Validators.required]]
    })
  }

  async ngAfterViewInit() {
    this.initMap();
  }

  async initMap() {
    const position = await Geolocation.getCurrentPosition();
    this.latLng = new L.LatLng(position.coords.latitude, position.coords.longitude);

    this.map = L.map('map', {
      center: this.latLng,
      zoom: 17,
      layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 20,
          minZoom: 3,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })
      ]
    });

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    this.customIcon = L.icon({
      iconUrl: this.icon,
      iconSize: [22, 32],
      iconAnchor: [16, 52],
      popupAnchor: [2, -40],
      shadowAnchor: [7, 45],
      shadowSize: [54, 51],
    });

    this.circle = L.circle(this.latLng, {
      color: '#1e232c',
      fillColor: '#8391A1',
      fillOpacity: 0.3,
      radius: 100,
    }).addTo(this.map);

    this.marker = L.marker(this.latLng, {
      icon: this.customIcon,
      draggable: true,
    }).addTo(this.map);

    this.marker.bindTooltip(
      `<div style="color:red">Distância máxima atingida.</div>`
    );

    const movingState = {
      moving: false,
      lastLat: this.latLng.lat,
      lastLng: this.latLng.lng,
    };

    this.marker.on('dragstart', () => {
      movingState.moving = true;
    });

    this.marker.on('dragend', () => {
      movingState.moving = false;
    });

    this.marker.on('drag', (e) => {
      const newLatLng = e.target.getLatLng();
      const circleCenter = this.circle.getBounds().getCenter();
      const distance = circleCenter.distanceTo(newLatLng);
      
      const { lat: mLat, lng: mLng } = this.marker.getLatLng();

    
      if (distance > this.circle.getRadius()) {
        this.marker.setLatLng([movingState.lastLat, movingState.lastLng]);
        this.marker.openTooltip();
      } else {
        movingState.lastLat = mLat;
        movingState.lastLng = mLng;
        this.latLng.lat = mLat;
        this.latLng.lng = mLng;
        this.marker.closeTooltip();
      }
    });

    this.circle.on('click', ({ latlng }) => {
      this.marker.setLatLng(latlng);
      movingState.lastLat = latlng.lat;
      movingState.lastLng = latlng.lng;
      this.latLng.lat = latlng.lat;
      this.latLng.lng = latlng.lng;
    });
  }


  onSelectCategory(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log(event.detail);
    this.selectedCategory = String(event.detail.value);
  }


  async addPhotoToGallery() {
    this.photoService.photos.splice(0, this.photoService.photos.length);
    await this.photoService.addNewToGallery();
    this.imageUrl = this.photoService.photos[0].webviewPath;
    for (let image of this.photoService.photos) {
      this.uploadedImages.push(image);
    }
  }

  onCreateNewPost() {
    if (this.form.invalid) {
      return;
    } 

    const formData = new FormData();
    const processedFiles = new Set<string>();

    if (this.uploadedImages?.[0].data) {
      if (!processedFiles.has(this.uploadedImages[0].filepath)) {
        processedFiles.add(this.uploadedImages[0].filepath);
        const blob = this.dataURItoBlob(this.uploadedImages[0].data);
        formData.append('image', blob!, this.uploadedImages[0].filepath);
      }
    } else {
      console.error("Erro: A propriedade 'data' na imagem é undefined ou null", this.uploadedImages[0]);
    }

    formData.append('tags', this.selectedCategory);
    formData.append('title', this.form.get('title')?.value);
    formData.append('latitude', String(this.latLng.lat));
    formData.append('longitude', String(this.latLng.lng));
    formData.append('text', this.form.get('description')?.value);


    this.loadingCtrl.create({
      message: 'Criando publicação...'
    })
      .then(loadingEl => {
        loadingEl.present();
        this.postService.newPost(formData as unknown as NewPost).subscribe({
          next: (res) => {
            console.log("res: ", res);
            loadingEl.dismiss();
            this.form.reset();
            this.photoService.photos.splice(0, this.photoService.photos.length);
            this.imageUrl = null;
            this.router.navigate(['/tabs/home']);

          },
          error: (err) => {
            console.error("Erro: ", err);
            this.alertCtrl.create({
              header: 'Ocorreu um erro ao criar uma publicação!',
              message: err.error.message,
              buttons: ['Ok']
            })
              .then(alertEl => {
                loadingEl.dismiss();
                alertEl.present();
              })
          }
        })
      })
  }

  dataURItoBlob(dataURI: string): Blob | null {
    if (!dataURI) {
      console.error('dataURI is undefined or null');
      return null;
    }

    const base64Index = dataURI.indexOf('base64,');
    if (base64Index === -1) {
      console.error('Invalid dataURI format');
      return null;
    }

    const byteString = atob(dataURI.slice(base64Index + 'base64,'.length));
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: 'image/jpeg' });
  }

  protected removeImage() {
    this.imageUrl = null;
    this.photoService.photos.splice(0, this.photoService.photos.length);
  }
}
