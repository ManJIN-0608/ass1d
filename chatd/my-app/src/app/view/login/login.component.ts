import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from './../../config/config.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [ConfigService],
})
export class LoginComponent implements OnInit {

  validateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private configservice: ConfigService,
    private store: LocalStorageService,
    private router: Router,
    private message: NzMessageService,
  ) {
  }

  async submitForm() {
    if (this.validateForm.valid) {
      let data: { [key: string]: any };
      data = await this.configservice.login(this.validateForm.value).toPromise();
      if (data.data) {
        this.store.set('user', data.data);
        this.router.navigate(['main']);
      } else {
        this.message.error(data.msg);
      }
    } else {
      // tslint:disable-next-line: forin
      for (const i in this.validateForm.controls) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }
  }

  async getUser() {
    const data = await this.configservice.getAll().toPromise();
    console.log('data --> ', data)
  }

  ngOnInit() {
    this.getUser();

    this.validateForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

}