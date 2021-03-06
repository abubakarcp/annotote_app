import { Component, trigger, transition, style, animate, NgZone, state } from '@angular/core';
import { IonicPage, ModalController, ViewController, NavParams } from 'ionic-angular';
import { AnototeList } from '../anotote-list/anotote-list';
import { Profile } from '../follows/follows_profile';

import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from "../../services/auth.service";
import { SearchService } from '../../services/search.service';
import { Constants } from '../../services/constants.service';
import { StatusBar } from "@ionic-native/status-bar";
/**
 * Generated class for the Follows page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-follows',
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
  templateUrl: 'follows.html',
})
export class Follows {
  private followings: any;
  private _loading: boolean;
  private no_followers_found: boolean = false;
  public show: boolean = true;
  public flyInOutState: String = 'out';
  public userToBeLoaded: number = 0;
  public typeToBeDisplayed: string = 'Follows'

  constructor(public constants: Constants,
    public viewCtrl: ViewController,
    params: NavParams,
    public searchService: SearchService,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    public utilityMethods: UtilityMethods,
    public statusbar: StatusBar) {
    this.statusbar.hide();
    this.followings = [];
    if (params.get('userid'))
      this.userToBeLoaded = params.get('userid');
    else
      this.userToBeLoaded = authService.getUser().id;
    if (params.get('type')) {
      this.typeToBeDisplayed = params.get('type');
    }
  }

  ionViewDidLoad() {
    this._loading = false;
    this.load_follows_list();
  }

  dismiss(action) {
    this.statusbar.show();
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss();
    }, 300)
  }

  showProfile(follower) {
    let profile = this.modalCtrl.create(Profile, {
      data: follower.id,
      from_page: 'follows'
    });
    profile.onDidDismiss(data => {
    });
    profile.present();
  }

  load_follows_list() {
    if (this.typeToBeDisplayed == 'Follows') {
      var params = {
        id: this.userToBeLoaded
      }
      this.authService.get_follows(params)
        .subscribe((res) => {
          this._loading = true;
          this.followings = res.data.user;
          if (this.followings.length == 0) {
            this.no_followers_found = true;
          }
        }, (error) => {
          this._loading = true;
        });
    } else {
      var params = {
        id: this.userToBeLoaded
      }
      this.authService.get_followers(params)
        .subscribe((res) => {
          this._loading = true;
          this.followings = res.data.user;
          if (this.followings.length == 0) {
            this.no_followers_found = true;
          }
        }, (error) => {
          this._loading = true;
        });
    }
  }

}
