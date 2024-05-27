import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {

  protected password_type: string = 'password';

  constructor(
    private router: Router,
    public authService: AuthService,
    private loadingCtrl: LoadingController,
    private storage: StorageService,
    private alertCtrl: AlertController
  ) { }

  protected togglePasswordMode() {
    this.password_type = this.password_type === 'text' ? 'password' : 'text';
  }

  protected async onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const values = {
      email: form.value.email,
      password: form.value.password
    }

    await this.loadingCtrl.create({
      message: "Autenticando..."
    })
      .then(loadingEl => {
        loadingEl.present();
        this.authService.login(values).subscribe({
          next: (res) => {
            this.authService.setIsAuthenticated(true);
            this.storage.set('token', res.token);
            console.log("Usuário logado: ", res)
            loadingEl.dismiss();
            form.reset();
            this.router.navigate(['/tabs/home']);
          },
          error: (err) => {
            console.error('Erro: ', err);
            this.alertCtrl.create({
              header: 'Ocorreu um erro ao tentar fazer login!',
              message: err.error.message,
              buttons: ['Ok']
            }).then(alertEl => {
              loadingEl.dismiss();
              alertEl.present();
            })
          }
        })
      })
  }

}
