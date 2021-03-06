import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, Events, ModalController } from 'ionic-angular';
import { UtilityMethods } from "../../services/utility_methods";
import { SearchService } from "../../services/search.service";
import { TagsExclusive } from '../tagsExclusive/tags';
@Component({
    selector: 'comment_detail_popup',
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateY(100%)', opacity: 0 }),
                    animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateY(0)', opacity: 1 }),
                    animate('300ms', style({ transform: 'translateY(100%)', opacity: 0 }))
                ])
            ]
        )
    ],
    templateUrl: 'create_anotation.html',
})
export class CreateAnotationPopup {
    private selectedTxt: string;
    private comment: string = '';
    private range: string;
    private sel: string;
    private show: boolean = true;
    public annotation;
    private show_autocomplete: boolean = false;
    private one_selected: { text: string, tagId: number, user_id: number, mentioned: number };
    private no_user_found: boolean = false;
    private no_tags_found: boolean = false;
    public user: any;
    private users: any = [];
    public isTagging: boolean = false;
    public nameEntered: string = '';
    public nameInputIndex: number = 0;
    private search_user: boolean = false;
    public mentioned: any = []
    public one: string = '';
    public currentIndex = 0;
    public bracketStartIndex = 0;
    public actual_ano = '';

    constructor(public params: NavParams,
        public viewCtrl: ViewController,
        public utilityMethods: UtilityMethods,
        private events: Events,
        private modalCtrl: ModalController,
        public searchService: SearchService) {
        this.selectedTxt = this.params.get('selected_txt');
        this.actual_ano = this.params.get('selected_txt');
        this.range = this.params.get('range');
        this.sel = this.params.get('sel');
        this.events.subscribe('closeModal', () => {
            this.dismiss();
        })
    }

    create() {
        if (this.comment != '') {
            var hashTags = this.searchTags('#');
            var cashTags = this.searchTags('$');
            var urls = this.uptags(this.comment);
            var mentions = this.userTags();
            this.show = false;
            setTimeout(() => {
                this.viewCtrl.dismiss({ create: true, text: this.selectedTxt, comment: this.comment, range: this.range, selection: this.sel, hash: hashTags, cash: cashTags, uptags: urls, mentions: mentions });
            }, 100)
        } else {
            this.utilityMethods.doToast("Please don't leave the comment field blank");
        }
    }

    uptags(comment) {
        var matches = [];
        matches = comment.match(/\bhttps?:\/\/\S+/gi);
        if (matches)
            for (let match of matches) {
                this.comment = this.comment.replace(match, '^');
            }
        return matches == null ? [] : matches;
    }

    userTags() {
        var matches = [];
        var finalized = [];
        matches = this.comment.split('`')
        for (let match of matches) {
            if (match[0] == '@') {
                finalized.push(match);
            }
        }
        return finalized;
    }

    searchTags(tag) {
        var tags = [];
        var check = false;
        if (this.comment[0] == tag) {
            check = true;
        }
        var tagsincomment = this.comment.split(tag);
        var i = check ? 0 : 1;
        for (var i = 1; i < tagsincomment.length; i++) {
            var temp = tagsincomment[i].split(' ');
            temp[0] = temp[0].replace(/[^\w\s]/gi, "")
            tags.push(temp[0]);
        }
        return tags;
    }

    tag_user(event) {
        if (event.key == '@' || event.key == '#' || event.key == '$') {
            this.nameInputIndex = event.target.selectionStart;
            var params = {
                tag: event.key,
                id: 0
            }
            if (event.key == '@')
                params.id = 2;
            else if (event.key == '#')
                params.id = 3
            else if (event.key == '$')
                params.id = 4

            let tagsExlusive = this.modalCtrl.create(TagsExclusive, params);
            tagsExlusive.onDidDismiss((data) => {
                if (data) {
                    if (params.id != 2)
                        this.comment = this.comment.substring(0, this.nameInputIndex) + data.tag + " " + this.comment.substring(this.nameInputIndex, this.comment.length);
                    else if (params.id == 2)
                        this.comment = this.comment.substring(0, this.nameInputIndex - 1) + data.tag + " " + this.comment.substring(this.nameInputIndex, this.comment.length);
                }
            })
            tagsExlusive.present();

        }
    }

    selected_user(user) {
        this.comment = this.comment.replace('@' + this.nameEntered, "`@" + user.firstName + "`")
        this.nameEntered = user.firstName;
        this.show_autocomplete = false;
        this.users = [];
        var selected = {
            text: '`@' + user.firstName + '`',
            tagId: 2,
            user_id: user.id
        }
        this.mentioned.push(selected)
        this.isTagging = false;
        this.nameInputIndex = 0;
    }

    dismiss() {
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss({ create: false, share: false });
        }, 100);
    }

    pressed(event) {
        this.selectedTxt = event;
        console.log(this.selectedTxt);
    }

}