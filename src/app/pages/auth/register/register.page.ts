import { Component } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage  {

  protected password_type: string = 'password';
  protected password_icon: 'eye' | 'eye-off-outline' =  'eye';
  protected formGroup: FormGroup;

  protected togglePasswordMode() {
    this.password_type = this.password_type === 'text' ? 'password' : 'text';
    this.password_icon = this.password_icon === 'eye' ? 'eye-off-outline' : 'eye';
  }

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      terms: [null, [Validators.required]]
    });
   }


  protected onRegister() {

  }

}
