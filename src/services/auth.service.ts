/**
 * Created by Bilal Akmal on 02/06/2017.
 */
import { Injectable } from '@angular/core';
import { User } from "../models/user";
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { Constants } from '../services/constants.service'
import { Http, RequestOptions, Headers } from "@angular/http";
import { stringify } from '@angular/compiler/src/util';

@Injectable()
export class AuthenticationService {

  /**
   * Variables
   */
  private _user: User;
  private _storage_ready: boolean;
  public dots_to_show: Array<any> = [
    {
      view: 'home'
    }
  ];
  public stateForDots: { from: any, which: any, actual: any, tote: any, received: any } = null;
  public LAST_VISITED_TOTE_STATE = null;
  private dummb = {
    selection: null,
    range: null
  }

  public constructor(public http: Http, public constants: Constants, public storage: Storage) {
    this.storage.ready().then(() => {
      this._storage_ready = true;
    });
  }

  public setDotState(from, which, actual, tote, received) {
    this.stateForDots = {
      from: from,
      which: which,
      actual: actual,
      tote: tote,
      received: received
    }
  }

  public reInitializeDots() {
    this.dots_to_show = [
      {
        view: 'home'
      }
    ];
  }

  public store(selection, range) {
    this.dummb.selection = selection;
    this.dummb.range = range;
  }

  public retrieve() {
    return this.dummb;
  }

  /**
   * Update User to Native Storage
   */
  public updateUser(user: User) {
    if (this._storage_ready) {
      this.storage.set('_user', user);
    }
    this._user = user;
  }

  /**
   * Set User to Native Storage
   */
  public setUser(user: User) {
    if (this._storage_ready) {
      this.storage.set('_user', user);
      this.storage.set('_token', user.access_token);
      localStorage.setItem('_token', user.access_token);
    }
    this._user = user;
  }

  /**
   * Get User from Native Storage
   */
  public getUser() {
    return this._user;
  }

  /**
   * Clear User from storage and memory
   */
  public clear_user() {
    this._user = null;
    this.storage.clear();
  }

  /**
   * Sync User from native storage to local memory
   */
  public sync_user() {
    var response = this.storage.get('_user').then((value) => {
      this._user = value;
      return value;
    });
    return response;
  }

  /**
     * Register API
     * type: {POST}
     * params: [email, password, device_type], 
     */
  public register(params) {
    var url = this.constants.API_BASEURL + '/register';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }

  public verifyUser(token) {
    var url = this.constants.API_BASEURL + '/verify_user/' + token;
    var response = this.http.get(url, {}).map(res => res.json());
    return response;
  }

  /**
   * Login API
   * type: {POST}
   * params: [email, password, device_type], 
   */
  public login(params) {
    var url = this.constants.API_BASEURL + '/login';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }

  /**
   * Logout API
   * type: {POST}
   * params: [], 
   */
  public get_follows(params) {
    var url = this.constants.API_BASEURL + '/get-follows?user_id=' + params.id;
    var response = this.http.get(url, {}).map(res => res.json());
    return response;
  }

  /**
   * getF followers
   */
  public get_followers(params) {
    var url = this.constants.API_BASEURL + '/get-followers?user_id=' + params.id;
    var response = this.http.get(url, {}).map(res => res.json());
    return response;
  }

  /**
   * Get User Follows API
   * type: {POST}
   * params: [], 
   */
  public logout() {
    var url = this.constants.API_BASEURL + '/logout';
    var response = this.http.get(url, {}).map(res => res.json());
    return response;
  }

  /**
   * Update Profile API
   * type: {POST}
   * params: [first_name, last_name, description, updated_at], 
   */
  public update_profile(params) {
    var url = this.constants.API_BASEURL + '/update-profile';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }

  /**
   * Reset Password API
   * type: {POST}
   * params: [old_password, new_password], 
   */
  public reset_password(params) {
    var url = this.constants.API_BASEURL + '/reset-password';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }

  public updatePassword(params) {
    var url = this.constants.API_BASEURL + '/update-password';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }

  /**
   * Forgot Password API
   * type: {POST}
   * params: [email], 
   */
  public forgot_password(params) {
    var url = this.constants.API_BASEURL + '/forgot-password';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }
}
