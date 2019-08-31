import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const config = 'http://localhost:3000'

@Injectable()
export class ConfigService {
    constructor(private http: HttpClient) { }


    getAll() {
        return this.http.get(config + '/getAll');
    }

    login(data: object) {
        return this.http.post(config + '/login', data);
    }

    addOrUp(data: object) {
        return this.http.post(config + '/addOrUp', data);
    }

    del(id: string) {
        const params = new HttpParams().set('id', id);
        return this.http.get(config + '/del', { params });
    }


    getGroup(data: object) {
        return this.http.post(config + '/getGroup', data);
    }
    addGroup(data: object) {
        return this.http.post(config + '/addGroup', data);
    }
    delGroup(groupname: object) {
        return this.http.post(config + '/delGroup', groupname);
    }


    getChannel(data: object) {
        return this.http.post(config + '/getChannel', data);
    }
    addChannels(data: object) {
        return this.http.post(config + '/addChannels', data);
    }
    delChannel(data: object) {
        return this.http.post(config + '/delChannel', data);
    }

  
    addmember(data: object) {
        return this.http.post(config + '/addmember', data);
    }
    delmember(data: object) {
        return this.http.post(config + '/delmember', data);
    }

}