/**
 * Created by Bilal Akmal on 02/06/2017.
 */
import { Injectable } from '@angular/core';
import { User } from "../models/user";
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { Constants } from '../services/constants.service'
import { Http, RequestOptions, Headers } from "@angular/http";

@Injectable()

export class SearchService {

    /**
     * Variables
     */
    private _user: User;

    public constructor(public http: Http, public constants: Constants, public storage: Storage) {
    }

    /**
     * Get User Profile API
     * type: {GET}
     * params: [user_id], 
     */
    public get_user_profile_info(user_id) {
        var url = this.constants.API_BASEURL + '/get-profile?user_id=' + user_id;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
     * Follow a User API
     * type: {POST}
     * params: [term], 
     */
    public follow_user(params) {
        var url = this.constants.API_BASEURL + '/follow-user';
        var response = this.http.post(url, params, {}).map(res => res.json());
        return response;
    }

    /**
     * UnFollow a User API
     * type: {POST}
     * params: [follower_id], 
     */
    public un_follow_user(params) {
        var url = this.constants.API_BASEURL + '/unfollow-user';
        var response = this.http.post(url, params, {}).map(res => res.json());
        return response;
    }

    /**
     * Search API
     * type: {GET}
     * params: [term], 
     */
    public general_search(term) {
        var url = this.constants.API_BASEURL + '/search?term=' + term;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }
}