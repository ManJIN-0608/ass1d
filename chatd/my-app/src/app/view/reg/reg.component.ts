import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from './../../config/config.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reg',
  templateUrl: './reg.component.html',
  styleUrls: ['./reg.component.css'],
  providers: [ConfigService],
})
export class RegComponent implements OnInit {

  validateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private configservice: ConfigService,
    private store: LocalStorageService,
    private message: NzMessageService,
    private router: Router,
  ) {
  }

  async submitForm() {
    if (this.validateForm.valid) {
      let data: { [key: string]: any };
      console.log('this.validateForm.value --> ', this.validateForm.value)
      data = await this.configservice.addOrUp(this.validateForm.value).toPromise();
      if (data.success) {
        this.message.info(data.msg);
        this.router.navigate(['login']);
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
      email: ['', [Validators.required, Validators.email]],
    });
  }

}