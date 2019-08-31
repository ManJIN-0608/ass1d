import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from './../../config/config.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  providers: [ConfigService],
})
export class MainComponent implements OnInit {

  listOfData: any;
  validateForm: FormGroup;
  groupsForm: FormGroup;
  channelsForm: FormGroup;
  // Superadmin  3
  isAdmin: boolean;
  // Groupadmin  2
  isChatAdmin: boolean;
  // Groupassis  1
  isGroup: boolean;
  // User  0
  isUser: boolean;
  isVisible: number;
  showType: boolean;
  loginName: string;
  modaltitle: string;
  infoObj: object;
  inputValue: string;

  public newGroupName: string;

  public selectedGroup;
  public selectedGroupName;
  public selectedChannel;
  public selectedChannelName;
  public groups = [];
  public channels = [];


  constructor(
    private fb: FormBuilder,
    private configservice: ConfigService,
    private store: LocalStorageService,
    private router: Router,
    private message: NzMessageService,

  ) {
  }

  getRule() {
    const rule = this.store.get('user').user.rule;
    this.loginName = this.store.get('user').user.username ? 'Hi!' + this.store.get('user').user.username : '';
    this.isUser = rule === 0 ? true : false;
    this.isGroup = rule === 1 ? true : false;
    this.isChatAdmin = rule === 2 ? true : false;
    this.isAdmin = rule === 3 ? true : false;
  }

  logout() {
    this.store.clear();
    this.router.navigate(['login']);
  }



  async submitForm() {
    if (this.validateForm.valid) {
      let data: { [key: string]: any };
      data = await this.configservice.login(this.validateForm.value).toPromise();
      if (data.data) {
        this.store.set('user', data.data);
        this.router.navigate(['main']);
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
    let data: { [key: string]: any };
    data = await this.configservice.getAll().toPromise();
    this.listOfData = data.data.users;
  }

  openGroup(name) {
    this.selectedGroupName = name;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].name == name) {
        this.selectedGroup = this.groups[i];
      }
    }
    console.log('this.selectedGroup --> :', this.selectedGroup)
    this.channels = this.selectedGroup.channels;
  }
  
  channelChangedHandler(name) {
    this.selectedChannelName = name;
    let found = false;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.channels.length; i++) {
      if (this.channels[i].name == name) {
        this.selectedChannel = this.channels[i];
        found = true;
      }
    }
    return found;
  }



  info(data: object) {
    this.isVisible = 1;
    this.showType = true;
    this.infoObj = data;
    this.modaltitle = 'Information';

  }

  edit(data: { [key: string]: any }) {
    this.isVisible = 2;
    this.showType = true;
    this.modaltitle = 'Edit';
    this.validateForm = this.fb.group({
      email: [data.email, [Validators.required]],
      username: [data.username, [Validators.required]],
      rule: [data.rule, [Validators.required]],
      id: [data.id, []],
      password: [data.password, []],
    });
  }

  handleCancel(): void {
    this.showType = false;
  }




  async  handleOk() {
    // Edit
    if (this.isVisible === 2) {
      if (this.validateForm.valid) {
        let data: { [key: string]: any };
        data = await this.configservice.addOrUp(this.validateForm.value).toPromise();
        if (data.success) {
          this.message.success(data.msg);
          this.showType = false;
          this.getUser();
        }
      } else {
        // tslint:disable-next-line: forin
        for (const i in this.validateForm.controls) {
          this.validateForm.controls[i].markAsDirty();
          this.validateForm.controls[i].updateValueAndValidity();
        }
      }
    } else {
      this.showType = false;
    }

  }

  async deleteRow(id: number) {
    let data: { [key: string]: any };
    data = await this.configservice.del('' + id).toPromise();
    if (data.success) {
      this.message.success(data.msg);
      this.getUser();
    } else {
      this.message.error(data.msg);
    }
  }

  async submitgroups() {

    if (this.groupsForm.valid) {
      let data: { [key: string]: any };
      data = await this.configservice.addGroup(this.groupsForm.value).toPromise();
      if (data.success) {
        this.message.success(data.msg);
        this.groupsForm = this.fb.group({
          newGroupName: ['', [Validators.required]],
        });
        this.getGroups();

      }
    } else {
      // tslint:disable-next-line: forin
      for (const i in this.groupsForm.controls) {
        this.groupsForm.controls[i].markAsDirty();
        this.groupsForm.controls[i].updateValueAndValidity();
      }
    }

  }

  async deleteGroup(groupname) {
    let data: { [key: string]: any };
    data = await this.configservice.delGroup({ groupname }).toPromise();
    if (data.success) {
      this.getGroups();
    }
  }

  async getGroups() {
    let data: { [key: string]: any };
    data = await this.configservice.getGroup({
      username: this.store.get('user').user.username
    }).toPromise();

    if (data.success) {
      this.groups = data.data.groups;
    }
  }




  async submitchannels() {

    if (this.channelsForm.valid) {
      let data: { [key: string]: any };
      const opt = {
        newchanname: this.channelsForm.value.newchanname,
        groupname: this.selectedGroupName,
      };
      data = await this.configservice.addChannels(opt).toPromise();
      if (data.success) {
        this.message.success(data.msg);
        this.channelsForm = this.fb.group({
          newchanname: ['', [Validators.required]],
        });
        this.getGroups();
        this.openGroup(this.selectedGroupName);
        this.channelChangedHandler(this.selectedChannelName);
      }
    } else {
      // tslint:disable-next-line: forin
      for (const i in this.channelsForm.controls) {
        this.channelsForm.controls[i].markAsDirty();
        this.channelsForm.controls[i].updateValueAndValidity();
      }
    }
  }

  async addmember(membername) {
    const opt = {
      membername,
      channame: this.selectedChannelName,
      groupname: this.selectedGroupName,
    };

    let data: { [key: string]: any };
    data = await this.configservice.addmember(opt).toPromise();
    if (data.success) {
      this.message.success(data.msg);
      this.getGroups();
      this.channelChangedHandler(this.selectedChannelName);
    }

  }

  async delmember(membername) {
    const opt = {
      membername,
      channame: this.selectedChannelName,
      groupname: this.selectedGroupName,
    };

    let data: { [key: string]: any };
    data = await this.configservice.delmember(opt).toPromise();
    if (data.success) {
      this.message.success(data.msg);
      this.getGroups();
      this.channelChangedHandler(this.selectedChannelName);
    }

  }











  showRule(type: number) {
    return {
      0: 'user',
      1: 'groupassis',
      2: 'groupadmin',
      3: 'superadmin',
    }[type];
  }
  ngOnInit() {
    this.getUser();
    this.getRule();
    this.getGroups();
    const selectedGroupName = this.selectedGroupName;

    this.validateForm = this.fb.group({
      email: ['', [Validators.required]],
      username: ['', [Validators.required]],
      rule: ['', [Validators.required]],
      id: ['', []],
      password: ['', []],
    });

    this.groupsForm = this.fb.group({
      newGroupName: ['', [Validators.required]],
    });

    this.channelsForm = this.fb.group({
      newchanname: ['', [Validators.required]],
    });







    const user = this.store.get('user');
    this.groups = user.groups;
    if (this.groups.length > 0) {
      console.log('this.groups[0].name --> :', this.groups[0].name)
      this.openGroup(this.groups[0].name);
      this.selectedGroupName = this.groups[0].name;
      if (this.groups[0].channels > 0) {
        this.channelChangedHandler(this.groups[0].channels[0].name);
        this.selectedChannelName = this.groups[0].channels[0].name;

      }
    }





  }


}
