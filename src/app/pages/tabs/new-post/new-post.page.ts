import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
})
export class NewPostPage implements OnInit, AfterViewInit {

  imageUrl: string = "";
  selectedSegment: string = 'elogio';

  map!: L.Map;
  customIcon!: L.Icon;  
  circle!: L.Circle;
  marker!: L.Marker;
  latLng!: L.LatLng;
  icon: string = "../../../../assets/localizador.png"

  constructor() { }

  async ngOnInit() {
  // 
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

      console.log('Nova posição do marcador:', newLatLng);

    
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


  segmentChanged(segment: string) {
    this.selectedSegment = segment;
  }

  takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
    });

    this.imageUrl = "data:image/jpeg;base64,"+image.base64String;
  };


  getCoords() {
    console.log("coords: ", this.latLng);
  }
}
