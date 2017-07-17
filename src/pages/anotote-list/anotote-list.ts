import { Component, ViewChild, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, ModalController, Content, NavController, ToastController, Toast, NavParams, AlertController } from 'ionic-angular';
import { AnototeDetail } from '../anotote-detail/anotote-detail';
import { AnototeEditor } from '../anotote-editor/anotote-editor';
import { Anotote } from '../../models/anotote';
import { StatusBar } from '@ionic-native/status-bar';
import { AnototeOptions } from '../anotote-list/tote_options';
import { ViewOptions } from '../anotote-list/view_options';
import { TagsPopUp } from '../anotote-list/tags';
import { FollowsPopup } from '../anotote-list/follows_popup';
import { Chat } from '../chat/chat';
import { Search } from '../search/search';

/**
 * Services
 */
import { SearchService } from '../../services/search.service';
import { UtilityMethods } from '../../services/utility_methods';
import { ListTotesModel } from "../../models/ListTotesModel";
import { AnototeService } from "../../services/anotote.service";
import { Follows } from "../follows/follows";
import { User } from "../../models/user";
import { AuthenticationService } from "../../services/auth.service";
import { ChatHeads } from "../../services/pipes"

@IonicPage()
@Component({
  selector: 'page-anotote-list',
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
    )
  ],
  templateUrl: 'anotote-list.html',
})

export class AnototeList {

  /**
   * Variables && Configs
   */
  @ViewChild(Content) content: Content;
  public anototes: Array<ListTotesModel>;
  public edit_mode: boolean; // True for edit list mode while false for simple list
  public current_active_anotote: ListTotesModel;
  public toast: Toast;
  public current_color: string;
  public reply_box_on: boolean;
  public whichStream: string = 'me';
  public current_page: number = 1;
  public has_totes: boolean = true;
  public messages: any = [];
  private reorder_highlights: boolean;
  public user: any;
  public selected_totes: Array<ListTotesModel> = [];
  /**
   * Constructor
   */
  constructor(public searchService: SearchService, public authService: AuthenticationService, public anototeService: AnototeService, public navCtrl: NavController, public modalCtrl: ModalController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods, private toastCtrl: ToastController, private alertCtrl: AlertController) {
    this.current_color = navParams.get('color');
    this.setStreamType(navParams.get('color'));
    this.reply_box_on = false;
    this.anototes = new Array<ListTotesModel>();
    this.user = authService.getUser();
    this.reorder_highlights = false;
  }

  public setStreamType(streamType) {
    if (streamType == 'follow') {
      this.whichStream = streamType + 's';
    } else {
      this.whichStream = streamType;
    }
  }

  /**
   * View LifeCycle Events
   */
  ionViewDidLoad() {
    // set status bar to green
    this.statusBar.backgroundColorByHexString('#3bde00');
    this.anototes = [];
    /**
     * Set default mode to list not the edit one
     */
    this.edit_mode = false;
    let anototes: Array<ListTotesModel> = [];

    this.utilityMethods.show_loader('', false);
    this.anototeService.fetchTotes(this.whichStream).subscribe((data) => {
      let stream = data.json().data.annototes;
      for (let entry of stream) {
        this.anototes.push(new ListTotesModel(entry.id, entry.type, entry.userToteId, entry.chatGroupId, entry.userAnnotote, entry.chatGroup, entry.createdAt, entry.updatedAt));
      }
      if (this.anototes.length == 0) {
        this.has_totes = false;
      }
      this.utilityMethods.hide_loader();
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    });
  }

  ionViewWillLeave() {
  }

  /**
   * Methods
   */

  showMeHighlights() {
    this.current_active_anotote.activeParty = 1;
    this.setSimpleToteDetails(this.getLoggedInUserId(), this.current_active_anotote.userAnnotote.id);
  }

  showTopHighlights() {
    this.current_active_anotote.activeParty = 3;
    this.setSimpleToteDetails(null, this.current_active_anotote.userAnnotote.id);
  }

  open_browser(anotote, highlight) {
    this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'anotote_list', WHICH_STREAM: this.whichStream, HIGHLIGHT_RECEIVED: highlight });
  }

  reorderItems(indexes, anotote) {
    let element = anotote.highlights[indexes.from];
    anotote.highlights.splice(indexes.from, 1);
    anotote.highlights.splice(indexes.to, 0, element);

    var _anotation_ids = "", _orders = "", counter = 1;
    for (let highlight of anotote.highlights) {
      _anotation_ids += highlight.id + ",";
      _orders += counter + ",";
      counter++;
    }
    if (_anotation_ids.length > 0)
      _anotation_ids = _anotation_ids.slice(0, -1);
    if (_orders.length > 0)
      _orders = _orders.slice(0, -1);

    this.searchService.reorder_anotation({ annotation_ids: _anotation_ids, order: _orders })
      .subscribe((res) => {
        console.log(res);
      }, (error) => {
        console.log(error);
      });
  }

  doInfinite(infiniteScroll) {
    this.anototeService.fetchTotes(this.whichStream, ++this.current_page).subscribe((data: any) => {
      let stream = data.json().data.annototes;
      for (let entry of stream) {
        this.anototes.push(new ListTotesModel(entry.id, entry.type, entry.userToteId, entry.chatGroupId, entry.userAnnotote, entry.chatGroup, entry.createdAt, entry.updatedAt));
      }
      infiniteScroll.complete();
      if (stream.length < 10) {
        infiniteScroll.enable(false);
      }
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    });

  }

  follows(event) {
    console.log(event)
    event.stopPropagation();
    this.navCtrl.push(Follows, {});
  }

  open_follows_popup(event) {
    event.stopPropagation();
    if (this.current_active_anotote.followers.length == 0)
      return false;
    let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: this.current_active_anotote.followers });
    anototeOptionsModal.onDidDismiss(data => {
      if (data != null) {
        this.utilityMethods.show_loader('loading follows totes...')
        this.anototeService.fetchToteDetails(data.user.id, this.current_active_anotote.userAnnotote.annotote.id).subscribe((data) => {
          this.current_active_anotote.setFollowerHighlights(data.json().data.annotote.highlights);
          this.utilityMethods.hide_loader()
        }, (error) => {
          this.utilityMethods.hide_loader();
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          }
        });
      }
    });
    anototeOptionsModal.present();
  }

  show_reply_box() {
    this.reply_box_on = true;
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  bulkAction(anotote) {
    if (anotote.active)
      return;
    if (this.edit_mode == false) {
      this.edit_mode = true;
      if (anotote.chatGroup == null) {
        anotote.checked = !anotote.checked;
        this.selected_totes.push(anotote);
      } else {
        this.utilityMethods.message_alert("Information", "You cannot select a chat tote. If you want to delete it, please long press it.");
      }
    } else {
      if (anotote.chatGroup != null) {
        this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to delete this chat group", () => {
          // var params = {
          //   userAnnotote_ids: anotote.userAnnotote.id,
          //   delete: 1
          // }
          // this.utilityMethods.show_loader('');
          // this.anototeService.delete_bulk_totes(params).subscribe((result) => {
          //   this.utilityMethods.hide_loader();
          //   if (result.data.annotote.length == 1) {
          //     this.anototes.splice(this.anototes.indexOf(anotote), 1);
          //     this.utilityMethods.doToast("Chat tote deleted Successfully.")
          //     this.close_bulk_actions();
          //   }
          // }, (error) => {
          //   this.utilityMethods.hide_loader();
          //   if (error.code == -1) {
          //     this.utilityMethods.internet_connection_error();
          //   }
          // })
        })
      }
    }
  }

  close_bulk_actions() {
    this.edit_mode = false;
    this.selected_totes = [];
    for (let tote of this.anototes) {
      if (tote.checked) {
        tote.checked = false;
      }
    }
  }

  popView() {
    this.navCtrl.pop();
  }

  go_to_editor(event) {
    // this.navCtrl.push(AnototeEditor, {});
  }

  openAnototeDetail(anotote: ListTotesModel) {
    this.reorder_highlights = false;
    if (!this.edit_mode) {
      if (this.current_active_anotote) {
        if (this.current_active_anotote.type == 2)
          this.content.resize();
        this.current_active_anotote.active = false;
        if (this.current_active_anotote.id == anotote.id) {
          this.current_active_anotote = null;
          return;
        }
      }
      this.current_active_anotote = anotote;
      this.current_active_anotote.active = !this.current_active_anotote.active;
      if (this.current_active_anotote.type == 2)
        this.content.resize();

      if (this.current_active_anotote.type == 1 && this.whichStream == 'me') {
        this.current_active_anotote.activeParty = 1;
        this.setSimpleToteDetails(this.getLoggedInUserId(), this.current_active_anotote.userAnnotote.id);
      } else if (this.current_active_anotote.type == 1 && this.whichStream == 'follows') {
        this.current_active_anotote.activeParty = 2;
        this.setSimpleToteDetails(this.current_active_anotote.userAnnotote.userId, this.current_active_anotote.userAnnotote.id);
      } else if (this.current_active_anotote.type == 2 && this.whichStream == 'me') {
        this.getQuickChatHistory(anotote);
      }
    } else {
      if (anotote.active) {
        anotote.active = false;
      }
      if (anotote.chatGroupId == null) {
        if (anotote.checked) {
          this.selected_totes.splice(this.selected_totes.indexOf(anotote), 1);
          anotote.checked = false;
        } else {
          this.selected_totes.push(anotote);
          anotote.checked = true;
        }
      } else {
        this.utilityMethods.message_alert("Information", "You cannot select a chat tote. If you want to delete it, please long press it.")
      }

    }
  }

  public getQuickChatHistory(tote) {
    this.utilityMethods.show_loader('');
    this.anototeService.quickChat(tote.chatGroup.groupUsers[1].user.id).subscribe((result) => {
      this.utilityMethods.hide_loader();
      if (result.status == 1) {
        this.messages = result.data.messages;
      } else {
        this.utilityMethods.doToast("Couldn't load chat history.");
      }
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
      this.utilityMethods.doToast("Couldn't load chat history.");
    });
  }

  enable_list_reorder() {
    if (this.whichStream == 'me')
      this.reorder_highlights = true;
  }

  public setSimpleToteDetails(user_id, tote_id) {
    this.utilityMethods.show_loader('');
    this.anototeService.fetchToteDetails(user_id, tote_id).subscribe((data) => {
      let annotote = data.json().data.annotote;
      let followers: Array<any> = [];
      for (let highlight of annotote.highlights) {
        if (highlight.deleted == 1) {
          annotote.highlights.splice(annotote.highlights.indexOf(highlight), 1);
        }
      }
      this.current_active_anotote.setHighlights(annotote.highlights);
      for (let follower of annotote.follows) {
        followers.push(new User(follower.id, follower.firstName, follower.lastName, follower.email, follower.password, follower.photo));
      }
      this.current_active_anotote.setFollowers(followers);
      this.utilityMethods.hide_loader();
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
        this.utilityMethods.doToast("Couldn't load chat history.");
      }
    });
  }

  public getLoggedInUserId() {
    return this.authService.getUser().id;
  }

  presentToast() {
    if (this.toast != null) {
      this.toast.dismiss();
    }
    this.toast = this.toastCtrl.create({
      message: 'Reply to Chantal Bardaro',
      position: 'bottom',
      dismissOnPageChange: true,
      showCloseButton: false,
      cssClass: 'bottom_snakbar'
    });

    this.toast.onDidDismiss(() => {
    });

    this.toast.present();
  }

  go_to_chat_thread(groupUsers: Array<any>) {
    let secondUser: any = null;
    for (let user of groupUsers) {
      if (user.id != this.getLoggedInUserId()) {
        secondUser = user;
      }
    }
    this.navCtrl.push(Chat, { secondUser: secondUser.user });
  }

  presentAnototeOptionsModal(event) {
    event.stopPropagation();
    let anototeOptionsModal = this.modalCtrl.create(AnototeOptions, null);
    anototeOptionsModal.onDidDismiss(data => {
      if (data == 'tags') {
        let tagsModal = this.modalCtrl.create(TagsPopUp, null);
        tagsModal.present();
      }
    });
    anototeOptionsModal.present();
  }

  openSearchPopup() {
    var url = null;
    console.log(this.current_active_anotote);
    if (this.current_active_anotote != null && this.current_active_anotote.userAnnotote)
      url = this.current_active_anotote.userAnnotote.annotote.link;
    let searchModal = this.modalCtrl.create(Search, { link: url });
    searchModal.onDidDismiss(data => {
      if (data != undefined || data != null) {
        this.anototes.push(data);
      }
      console.log(data);
    });
    searchModal.present();
  }

  presentViewOptionsModal() {
    let viewsOptionsModal = this.modalCtrl.create(ViewOptions, null);
    viewsOptionsModal.present();
  }

  share_totes() {
    var message = '';
    for (let tote of this.anototes) {
      if (tote.checked) {
        message += tote.userAnnotote.filePath + '\n';
      }
    }
    this.utilityMethods.share_content_native(message, '', '', '');
  }

  confirm_popUp(action) {
    if (this.selected_totes.length > 0) {
      if (action == 'delete') {
        var message = '';
        if (this.selected_totes.length == 1)
          message = "Do you really want to delete this anotation?"
        else
          message = "Do you really want to delete these anotation?"

        this.utilityMethods.message_alert_with_callback("Are you sure?", message, () => {
          this.delete_totes();
        })
      } else if (action == 'privacy') {
        this.utilityMethods.message_alert_with_callback("Are you sure?", "Do you really want to change privacy?", () => {
          this.tote_privacy();
        })
      }
    } else {
      this.utilityMethods.doToast("Please, select an anotote first.");
    }

  }

  delete_totes() {
    var ids = '';
    for (let anotote of this.selected_totes) {
      if (ids == '')
        ids += anotote.userAnnotote.id
      else
        ids += ',' + anotote.userAnnotote.id
    }
    var params = {
      userAnnotote_ids: ids,
      delete: 1
    }
    this.utilityMethods.show_loader('');
    this.anototeService.delete_bulk_totes(params).subscribe((result) => {
      this.utilityMethods.hide_loader();
      if (result.data.annotote.length == this.selected_totes.length) {
        for (let tote of this.selected_totes) {
          this.anototes.splice(this.anototes.indexOf(tote), 1);
        }
        this.utilityMethods.doToast("Deleted Successfully.")
        this.close_bulk_actions();
      }
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    })
  }

  tote_privacy() {
    var ids = '';
    for (let anotote of this.selected_totes) {
      if (ids == '')
        ids += anotote.userAnnotote.id
      else
        ids += ',' + anotote.userAnnotote.id
    }
    var params = {
      userAnnotote_ids: ids,
      privacy: 1
    }
    this.utilityMethods.show_loader('', false);
    this.anototeService.privatize_bulk_totes(params).subscribe((result) => {
      this.utilityMethods.hide_loader();
      if (result.data.annotote.length == this.selected_totes.length) {
        for (let tote of this.selected_totes) {
          tote.userAnnotote.privacy = 1;
        }
        this.utilityMethods.doToast("Privacy successfully updated.");
        this.close_bulk_actions();
      }
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    })
  }

}
