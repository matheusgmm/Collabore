import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage  {

  password_type: string = 'password';
  password_icon: 'eye-outline' | 'eye-off-outline' =  'eye-outline';
  formGroup: FormGroup;
  accepted_terms: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router,
    private storage: StorageService
  ) {
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
   }

  protected togglePasswordMode(): void {
    this.password_type = this.password_type === 'text' ? 'password' : 'text';
    this.password_icon = this.password_icon === 'eye-outline' ? 'eye-off-outline' : 'eye-outline';
  }

  protected acceptTerms(): void {
    this.accepted_terms = !this.accepted_terms;
  }


   protected async onRegister() {
    if (this.formGroup.invalid) {
      return;
    }

    if (
      this.formGroup.valid && 
      this.formGroup.value && 
      this.accepted_terms &&
      this.formGroup.get('password')?.value === this.formGroup.get('confirmPassword')?.value 
    ) {
        const values = {
          name: this.formGroup.get('name')?.value,
          email: this.formGroup.get('email')?.value,
          password: this.formGroup.get('password')?.value
        }

        await this.loadingCtrl.create({
          message: "Registrando..."
        })
          .then(loadingEl => {
            loadingEl.present();
            this.authService.createAccount(values).subscribe({
              next: (res) => {
                console.log("Conta criado com sucesso! ", res);
                this.formGroup.reset();
                loadingEl.dismiss();
                this.router.navigate(['tabs/home']);
              },
              error: (err) => {
                console.error("Error: ", err);
                this.alertCtrl.create({
                  header: 'Ocorreu um erro ao tentar se registrar!',
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
}
