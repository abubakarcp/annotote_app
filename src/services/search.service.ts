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
    public saved_searches = [];

    public constructor(public http: Http, public constants: Constants, public storage: Storage) {
    }

    /**
     * AlreadySavedSearches
     */
    public AlreadySavedSearches(term) {
        for (let searches of this.saved_searches)
            if (searches.term == term)
                return false;

        return true;
    }

    public getAlreadySavedSearches(term) {
        for (let searches of this.saved_searches)
            if (searches.term == term)
                return searches;

        return null;
    }
    public responseManipulation(response) {
        var totes = [], chats = [], users = [];
        var search_results = [];
        for (let tote of response.data.annotote) {
            if (tote.annotote) {
                if (tote.userAnnotote) {
                    tote.is_tote = true;
                    tote.active = false;
                    tote.userAnnotote.userAnnotote.follows = tote.userAnnotote.follows;
                    tote.userAnnotote.userAnnotote.highlights = tote.userAnnotote.highlights;
                    tote.userAnnotote.userAnnotote.isMe = tote.userAnnotote.isMe;
                    tote.userAnnotote.userAnnotote.isTop = tote.userAnnotote.isTop;
                    tote.userAnnotote.spinner_for_active = false;
                    var active_tab = 'anon';
                    if (tote.userAnnotote.isMe == 1) {
                        tote.userAnnotote.userAnnotote.my_highlights = Object.assign(tote.userAnnotote.highlights);
                        tote.userAnnotote.userAnnotote.meFilePath = Object.assign(tote.userAnnotote.userAnnotote.filePath);
                        active_tab = 'me'
                    } else if (tote.userAnnotote.isMe == 0 && tote.userAnnotote.isTop == 0) {
                        active_tab = 'follows';
                        if (tote.userAnnotote.follows.length == 0 || tote.userAnnotote.follows.length == undefined) {
                            tote.userAnnotote.follows = []
                            tote.userAnnotote.user.followTote = tote.userAnnotote.userAnnotote;
                            tote.userAnnotote.follows.push(tote.userAnnotote.user);
                        }
                    } else if (tote.userAnnotote.isTop == 1) {
                        // if (tote.userAnnotote.isTop != 1) {
                        //   tote.userAnnotote.isTop = 1;
                        //   tote.userAnnotote.userAnnotote.isTop = 1;
                        //   if (tote.userAnnotote.topUserToteId == 0) {
                        //     tote.userAnnotote.topUserToteId = tote.userAnnotote.id;
                        //   }
                        // }
                        active_tab = 'top';
                        tote.userAnnotote.top_highlights = Object.assign(tote.userAnnotote.highlights);
                    }
                    tote.userAnnotote.active_tab = active_tab;
                    if (tote.userAnnotote.follows.length > 0) {
                        tote.userAnnotote.selected_follower_name = tote.userAnnotote.follows[0].firstName;
                    }
                    totes.push(tote);
                    search_results.push(tote);
                }
            }
        }
        for (let group of response.data.group) {
            var anotote = {
                isChat: true,
                is_tote: false,
                chatGroup: group
            }
            chats.push(anotote);
            search_results.push(anotote);
        }
        for (let user of response.data.user) {
            user.is_tote = false;
            user.isChat = false;
            user.follow_loading = false;
            users.push(user);
            search_results.push(user);
        }
        return {
            totes: totes,
            chats: chats,
            users: users,
            search_results: search_results
        }
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
    public general_search(params) {
        var url = this.constants.API_BASEURL + '/search?term=' + params.term;
        if (params.type != '')
            url = url + '&type=' + params.type;
        if (params.annotote_type != '')
            url = url + '&annotote_type=' + params.annotote_type;
        if (params.time != 0)
            url = url + '&time=' + params.time;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
     * Create Anotote API
     * type: {POST}
     * params: [url, created_at], 
     */
    public create_anotote(params) {
        var url = this.constants.API_BASEURL + '/create-annotote';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    public hypothesis_scrapping(params) {
        var url = this.constants.HYPOTHESIS_SCRAPPING_BASEURL + params.url;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
     * Save search entry
     * type: {POST}
     * params: [searched_term, book_marked, created_at]
     */
    public save_search_entry(params) {
        var url = this.constants.API_BASEURL + '/search/save';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
     * Get search entries
     * type: {GET}
     * params: [searched_term, book_marked, created_at]
     */
    public get_search_entries() {
        var url = this.constants.API_BASEURL + '/search/get';
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
     * Remove search entry
     * type: {GET}
     * params: [search_id]
     */
    public remove_search_id(search_id) {
        var url = this.constants.API_BASEURL + '/search/delete?search_id=' + search_id;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
    * Save Anotote to ME Stream API
    * type: {POST}
    * params: [annotote_id, user_id, created_at]
    */
    public save_anotote_to_me_stream(params) {
        var url = this.constants.API_BASEURL + '/save-annotote';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
    * Add Tag to Anotote API
    * type: {POST}
    * params: [user_tote_id, tag_text, created_at]
    */
    public add_tag_to_anotote(params) {
        var url = this.constants.API_BASEURL + '/annotote/createTag';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
    * Add Tag to Anotote API
    * type: {POST}
    * params: [tag_id, annotation_id, text, created_at]
    */
    public add_tag_to_anotation(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/createTag';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
     * Add tags to chat tote
     */
    public add_tag_to_chatTote(params) {
        var url = this.constants.API_BASEURL + '/chat/createTag';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
     * Add tags to chat message
     */
    public add_tag_to_message(params) {
        var url = this.constants.API_BASEURL + '/chat/createMessageTag';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    public add_tag_to_anotation_all(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/createTagAll';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    public autocomplete_users(params) {
        var url = this.constants.API_BASEURL + '/search/followers?name_like=' + params.name;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    public autocomplete_tags(params) {
        var url = this.constants.API_BASEURL + '/tag-intellisense?query=' + params.value + '&&tag_id=' + params.id;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }


    /**
    * Load advance search results  API
    * type: {GET}
    * params: [text_string]
    */
    public get_search_results(txt_string) {
        var url = this.constants.SEARCH_API_BASEURL + '/select?indent=on&wt=json&q=type:annotote&fq=' + txt_string;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
    * Create Anotation on Anotote API
    * type: {POST}
    * params: [url, created_at]
    */
    public create_anotation(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/create';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
    * Remove Anotation API
    * type: {POST}
    * params: [annotation_id, delete]
    */
    public remove_anotation(params) {
        var url = this.constants.API_BASEURL + '/delete-user-annotation';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
    * Update Anotation API
    * type: {POST}
    * params: [annotation_id, highlight_text, file_text, comment, identifier, updated_at]
    */
    public update_anotation(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/update';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
    * Reorder Anotation API
    * type: {POST}
    * params: [annotation_ids, order]
    */
    public reorder_anotation(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/updateOrder';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
     * Get Anotote Content API
     * type: {GET}
     * params: [url], 
     */
    public get_anotote_content(url) {
        var response = this.http.get(url);
        return response;
    }

    public get_full_screenContent(params) {
        var url = 'http://139.162.37.73/anotote/api/get-url-content?url=' + params.url;
        var response = this.http.get(url);
        return response;
    }

    public vote_anotation(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/vote';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    public addToMeStream(params) {
        var url = this.constants.API_BASEURL + '/annotote/addToMeStream';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    public add_tags_to_profile(params) {
        var url = this.constants.API_BASEURL + '/user/createTag';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }
    public add_tags_to_profile_all(params) {
        var url = this.constants.API_BASEURL + '/user/createTagAll';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    public delete_anotote_tag(params) {
        var url = this.constants.API_BASEURL + '/annotote/deleteTag?annotote_tag_id=' + params.tagId;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    public delete_chat_tag(params) {
        var url = this.constants.API_BASEURL + '/chat/deleteTag?chat_tag_id=' + params.tagId;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    public delete_message_tag(params) {
        var url = this.constants.API_BASEURL + '/chat/deleteMessageTag?message_tag_id=' + params.tagId;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    public delete_profile_tag(params) {
        var url = this.constants.API_BASEURL + '/user/deleteTag?user_tag_id=' + params.tagId;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }
}
