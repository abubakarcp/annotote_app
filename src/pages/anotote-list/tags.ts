import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ModalController } from 'ionic-angular';
import { SearchService } from '../../services/search.service';
import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from '../../services/auth.service';
import { StatusBar } from "@ionic-native/status-bar";
import { TagsOptions } from "./tags_options";
@Component({
    selector: 'tags_popup',
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateY(100%)', opacity: 0 }),
                    animate('500ms', style({ transform: 'translateY(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateY(0)', opacity: 1 }),
                    animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 }))
                ])
            ]
        )],
    templateUrl: 'tags.html',
})
export class TagsPopUp {
    private tag_input: string;
    private tags = [];
    private user_tote_id: string;
    private stream: string;
    private annotation_id;
    private tags_type: any = 2;
    private anotation_or_anotote: boolean;
    private users: any = [];
    private search_user: boolean = false;
    private show_autocomplete: boolean = false;
    private one_selected = [];
    private no_user_found: boolean = false;
    private no_tags_found: boolean = false;
    public show: boolean = true;
    public user: any;
    public anotote_of_anotation_id;
    public isTagging: boolean = false;
    public nameEntered: string = '';
    public nameInputIndex: number = 0;
    public profile: any = '';
    //for chat tags
    public chatId;
    public participants = [];
    public chatOrtxt: boolean = true;
    public search;

    constructor(public statusbar: StatusBar,
        private utilityMethods: UtilityMethods,
        public authService: AuthenticationService,
        private params: NavParams,
        public modalCtrl: ModalController,
        public viewCtrl: ViewController,
        public searchService: SearchService) {
        statusbar.hide();
        this.tag_input = "";
        this.user = this.authService.getUser();
        this.stream = params.get('whichStream');
        this.tags = params.get('tags');
        if (this.tags.length == 0)
            this.no_tags_found = true;
        if (this.stream != 'chat') {
            this.anotation_or_anotote = params.get('annotote');
            if (this.anotation_or_anotote) {
                this.user_tote_id = params.get('user_tote_id');
            } else {
                if (!params.get('profile')) {
                    this.annotation_id = params.get('annotation_id');
                    this.anotote_of_anotation_id = params.get('user_annotote_id');
                } else {
                    this.profile = params.get('profile');
                }
            }
        } else {
            this.chatOrtxt = params.get('chatOrTxt');
            this.chatId = params.get('chatId');
            this.participants = params.get('participants');
        }
        if (params.get('search')) {
            this.search = params.get('search');
        }
    }

    add_tag(type, tag) {
        if (this.stream != 'chat') {
            if (this.anotation_or_anotote) {
                var current_time = this.utilityMethods.get_php_wala_time();
                var paramsObj = {
                    user_tote_id: this.user_tote_id,
                    tag_text: tag,
                    created_at: current_time,
                    tag_id: type
                }
                if (type == 2 && this.one_selected.length > 0) {
                    for (let user of this.one_selected) {
                        if (user.firstName == tag) {
                            paramsObj['user_id'] = user.id
                        }
                    }
                } else if (type == 2 && this.one_selected.length == 0) {
                    this.utilityMethods.doToast("Please select a user to tag.");
                    return;
                }
                var toast = this.utilityMethods.doLoadingToast('Tagging');
                this.searchService.add_tag_to_anotote(paramsObj)
                    .subscribe((res) => {
                        toast.dismiss();
                        this.tags.push(res.data.annotote_tag);
                        this.tag_input = '';
                        if (this.tags.length > 0)
                            this.no_tags_found = false;
                    }, (error) => {
                        toast.dismiss();
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        } else {
                            this.utilityMethods.doToast("Couldn't add tag to annotote.");
                        }
                    });
            } else {
                if (!this.params.get('profile')) {
                    var params = {
                        tag_id: type,
                        annotation_id: this.annotation_id,
                        user_annotote_id: this.anotote_of_anotation_id,
                        text: tag,
                        created_at: this.utilityMethods.get_php_wala_time(),
                    }
                    // if (type == 2 && this.one_selected != null)
                    //     params['user_id'] = this.one_selected.id;
                    // else if (type == 2 && this.one_selected == null) {
                    //     this.utilityMethods.doToast("Please select a user to tag.");
                    //     return;
                    // }
                    var toast = this.utilityMethods.doLoadingToast('Tagging');
                    this.searchService.add_tag_to_anotation(params).subscribe((result) => {
                        toast.dismiss();
                        this.tags.push(result.data.annotation_tag);
                        this.tag_input = '';
                        if (this.tags.length > 0)
                            this.no_tags_found = false;
                    }, (error) => {
                        toast.dismiss();
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        } else {
                            this.utilityMethods.doToast("Couldn't add tag to annotation.");
                        }
                    })
                } else {
                    var userParams = {
                        tag_id: type,
                        user_id: this.user.id,
                        tag_text: tag,
                        created_at: this.utilityMethods.get_php_wala_time()
                    }
                    if (type == 2 && this.one_selected.length > 0) {
                        for (let user of this.one_selected) {
                            if (user.firstName == tag) {
                                userParams['user_id'] = user.id
                            }
                        }
                    } else if (type == 2 && this.one_selected.length == 0) {
                        this.utilityMethods.doToast("Please select a user to tag.");
                        return;
                    }
                    var toast = this.utilityMethods.doLoadingToast('Tagging');
                    this.searchService.add_tags_to_profile(userParams)
                        .subscribe((res) => {
                            toast.dismiss();
                            this.tags.push(res.data.user_tag);
                            this.tag_input = '';
                            if (this.tags.length > 0)
                                this.no_tags_found = false;
                        }, (error) => {
                            toast.dismiss();
                            if (error.code == -1) {
                                this.utilityMethods.internet_connection_error();
                            } else {
                                this.utilityMethods.doToast("Couldn't add tag.");
                            }
                        });
                }
            }
        } else {
            if (this.chatOrtxt) {
                var paramters: any = {
                    chat_id: this.chatId,
                    tag_text: tag,
                    created_at: this.utilityMethods.get_php_wala_time(),
                    tag_id: type
                }
                if (type == 2 && this.one_selected.length > 0) {
                    for (let user of this.one_selected) {
                        if (user.firstName == tag) {
                            paramters['user_id'] = user.id
                        }
                    }
                } else if (type == 2 && this.one_selected.length == 0) {
                    this.utilityMethods.doToast("Please select a user to tag.");
                    return;
                }
                var toast = this.utilityMethods.doLoadingToast('Tagging');
                this.searchService.add_tag_to_chatTote(paramters)
                    .subscribe((res) => {
                        toast.dismiss();
                        this.tags.push(res.data.chat_tag);
                        this.tag_input = '';
                        if (this.tags.length > 0)
                            this.no_tags_found = false;
                    }, (error) => {
                        toast.dismiss();
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        } else {
                            this.utilityMethods.doToast("Couldn't add tag to annotote.");
                        }
                    });
            } else {
                var paramters: any = {
                    message_id: this.chatId,
                    tag_text: tag,
                    created_at: this.utilityMethods.get_php_wala_time(),
                    tag_id: type
                }
                if (type == 2 && this.one_selected.length > 0) {
                    for (let user of this.one_selected) {
                        if (user.firstName == tag) {
                            paramters['user_id'] = user.id
                        }
                    }
                } else if (type == 2 && this.one_selected.length == 0) {
                    this.utilityMethods.doToast("Please select a user to tag.");
                    return;
                }
                var toast = this.utilityMethods.doLoadingToast('Tagging');
                this.searchService.add_tag_to_message(paramters)
                    .subscribe((res) => {
                        toast.dismiss();
                        this.tags.push(res.data.message_tag);
                        this.tag_input = '';
                        if (this.tags.length > 0)
                            this.no_tags_found = false;
                    }, (error) => {
                        toast.dismiss();
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        } else {
                            this.utilityMethods.doToast("Couldn't add tag to annotote.");
                        }
                    });
            }
        }
    }

    saveTags() {
        var hashtags = this.searchTags('#');
        var cashtags = this.searchTags('$');
        var uptags = this.uptags();
        var followtags = this.userTags();

        if (hashtags.length > 0 || cashtags.length > 0 || followtags.length > 0 || uptags) {
            if (hashtags.length > 0)
                for (let hash of hashtags)
                    this.add_tag(3, hash);
            if (cashtags.length > 0)
                for (let cash of cashtags)
                    this.add_tag(4, cash);
            if (followtags.length > 0)
                for (let user of followtags)
                    this.add_tag(2, user);
            if (uptags.length > 0)
                for (let ups of uptags)
                    this.add_tag(1, ups);

        } else {
            this.utilityMethods.doToast("Please Enter #,$,@ sign before writing tag or paste a url.");
        }
    }

    uptags() {
        var matches = [];
        matches = this.tag_input.match(/\bhttps?:\/\/\S+/gi);
        return matches == null ? [] : matches;
    }

    tag_user() {
        if (this.tag_input[this.tag_input.length - 1] == '@') {
            this.nameInputIndex = this.tag_input.length - 1;
            this.isTagging = true;
        }
        if (this.isTagging) {
            if (this.nameInputIndex > this.tag_input.length - 1) {
                this.show_autocomplete = false;
                this.users = [];
                this.isTagging = false;
                this.nameInputIndex = 0;
                return;
            } else if (this.nameInputIndex != this.tag_input.length - 1) {
                this.nameEntered = this.tag_input.substr(this.nameInputIndex + 1);
                if (this.nameEntered.split(' ').length == 1) {
                    var params = {
                        name: this.nameEntered
                    }
                    if (params.name != '') {
                        this.no_user_found = false;
                        this.show_autocomplete = true;
                        this.search_user = true;
                        this.users = [];
                        this.searchService.autocomplete_users(params).subscribe((result) => {
                            this.search_user = false;
                            this.users = result.data.users;
                            if (this.users.length == 0) {
                                this.no_user_found = true;
                            }
                        }, (error) => {
                            this.search_user = false;
                            this.show_autocomplete = true;
                            this.no_user_found = false;
                            this.users = [];
                            if (error.code == -1) {
                                this.utilityMethods.internet_connection_error();
                            }
                        })
                    }
                } else {
                    this.show_autocomplete = false;
                    this.users = [];
                    this.isTagging = false;
                    this.nameInputIndex = 0;
                    return;
                }
            }

        }
    }

    userTags() {
        var matches = [];
        var finalized = [];
        matches = this.tag_input.split('`')
        for (let match of matches) {
            if (match[0] == '@') {
                match = match.replace('@', '');
                finalized.push(match);
            }
        }
        return finalized;
    }

    searchTags(tag) {
        var tags = [];
        var check = false;
        if (this.tag_input[0] == tag) {
            check = true;
        }
        var tagsincomment = this.tag_input.split(tag);
        var i = check ? 0 : 1;
        for (var i = 1; i < tagsincomment.length; i++) {
            var temp = tagsincomment[i].split(' ');
            temp[0] = temp[0].replace(/[^\w\s]/gi, "")
            tags.push(temp[0]);
        }
        return tags;
    }

    selected_user(user) {
        // this.tag_input = this.tag_input.replace('@' + this.nameEntered, "`@" + user.firstName + "`")
        // this.tag_input = '@' + user.firstName;
        this.show_autocomplete = false;
        this.users = [];
        this.one_selected.push(user);
        this.add_tag(2, user.firstName);
    }

    dismiss() {
        this.statusbar.show();
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss();
        })
    }

    browser() {
        this.statusbar.show();
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss({ browseIt: true });
        })
    }

    tagOptions(tag) {
        if (this.stream == 'me') {
            var params = {
                tag: tag
            }
            let tagOptions = this.modalCtrl.create(TagsOptions, params);
            tagOptions.onDidDismiss(data => {
                if (data.delete) {
                    if (this.anotation_or_anotote) {
                        var params = {
                            tagId: tag.id
                        }
                        var toast = this.utilityMethods.doLoadingToast('Deleting');
                        this.searchService.delete_anotote_tag(params).subscribe((success) => {
                            toast.dismiss();
                            this.tags.splice(this.tags.indexOf(tag), 1);
                        }, (error) => {
                            toast.dismiss();
                        })
                    } else if (this.stream == 'chat') {
                        if (this.chatOrtxt == true) {
                            var params = {
                                tagId: tag.id
                            }
                            var toast = this.utilityMethods.doLoadingToast('Deleting');
                            this.searchService.delete_chat_tag(params).subscribe((success) => {
                                toast.dismiss();
                                this.tags.splice(this.tags.indexOf(tag), 1);
                            }, (error) => {
                                toast.dismiss();
                            })
                        } else {
                            var params = {
                                tagId: tag.id
                            }
                            var toast = this.utilityMethods.doLoadingToast('Deleting');
                            this.searchService.delete_message_tag(params).subscribe((success) => {
                                toast.dismiss();
                                this.tags.splice(this.tags.indexOf(tag), 1);
                            }, (error) => {
                                toast.dismiss();
                            })
                        }
                    } else {
                        var params = {
                            tagId: tag.id
                        }
                        var toast = this.utilityMethods.doLoadingToast('Deleting');
                        this.searchService.delete_profile_tag(params).subscribe((success) => {
                            toast.dismiss();
                            this.tags.splice(this.tags.indexOf(tag), 1);
                        }, (error) => {
                            toast.dismiss();
                        })
                    }
                }
            })
            tagOptions.present();
        }
    }

    pinImage(event: Event) {
        event.stopPropagation();
        if (this.search.id == 0) {
            var paramsObj = {
                created_at: this.utilityMethods.get_php_wala_time(),
                searched_term: this.tags[0].annotote.link,
                title: this.tags[0].annotote.title,
                book_marked: 0
            }
            var toast = this.utilityMethods.doLoadingToast('Pinning bookmark...')
            this.searchService.save_search_entry(paramsObj).subscribe((result) => {
                toast.dismiss();
                this.searchService.saved_searches[this.searchService.saved_searches.indexOf(this.search)] = result.data.search;
                // this.toastInFooter("Pinned");
            }, (error) => {
                toast.dismiss();
                if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                } else {
                    this.utilityMethods.doToast("Coudln't pinn");
                }
            });
        } else {
            var toast = this.utilityMethods.doLoadingToast("Unpinning bookmark...");
            this.searchService.remove_search_id(this.search.id)
                .subscribe((response) => {
                    this.searchService.saved_searches.splice(this.searchService.saved_searches.indexOf(this.search), 1);
                    this.search.id = 0;
                    toast.dismiss();
                }, (error) => {
                    toast.dismiss();
                    if (error.code == -1) {
                        this.utilityMethods.internet_connection_error();
                    } else {
                        this.utilityMethods.doToast("Couldn't Unpinn");
                    }
                });
        }
    }

}