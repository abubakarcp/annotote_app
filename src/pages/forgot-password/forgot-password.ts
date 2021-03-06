import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Keyboard, ModalController } from 'ionic-angular';
import { Home } from '../home/home';
import * as _ from 'underscore/underscore';
import { StatusBar } from '@ionic-native/status-bar';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from '../../services/auth.service';
import { Verification } from "../signup/verificationPopUp";

@Component({
  selector: 'page-forgotpassword',
  templateUrl: 'forgot-password.html',
})
export class ForgotPassword {

  /**
   * Variables && Configs
   */
  public forgot_password_email: string;
  public focus_field: string;
  public field_error = {
    email: false
  };

  constructor(public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public statusBar: StatusBar,
    public utilityMethods: UtilityMethods,
    public modalCtrl: ModalController,
    public authService: AuthenticationService,
    public keyboard: Keyboard) {
    // set status bar to green
    // this.statusBar.backgroundColorByHexString('000000');
    this.focus_field = '';
    this.forgot_password_email = '';
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() { }

  popView() {
    this.navCtrl.pop();
  }

  changeColor(field) {
    this.focus_field = field;
    if (field != '') {
      if (field == 'email')
        this.field_error.email = false;
    }
  }

  go_home() {
    this.keyboard.close();
    /**
     * Validate User first
     */
    var _error = false;
    if (_.isEmpty(this.forgot_password_email) || !this.utilityMethods.validate_email(this.forgot_password_email)) {
      _error = true;
      this.field_error.email = true;
    }
    if (_error) {
      //this.utilityMethods.message_alert('Error', 'Please enter valid email.');
      return;
    }

    /**
     * API call, after Successfull validation
     */
    var current_time = (new Date()).getTime() / 1000,
      platform_name = this.platform.is('ios') ? 'ios' : 'android';
    var toast = this.utilityMethods.doLoadingToast('Please wait...');
    this.authService.forgot_password({
      email: this.forgot_password_email
    }).subscribe((response) => {
      toast.dismiss();
      let VerificationPop = this.modalCtrl.create(Verification, { forgot: true });
      VerificationPop.onDidDismiss(data => {
        this.navCtrl.pop();
      })
      VerificationPop.present();
    }, (error) => {
      toast.dismiss();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      } else if (error.status == 451) {
        let VerificationPop = this.modalCtrl.create(Verification, { forgot: true, verified: false });
        VerificationPop.onDidDismiss(data => {
          this.navCtrl.pop();
        })
        VerificationPop.present();
      } else {
        let VerificationPop = this.modalCtrl.create(Verification, { forgot: true, verified: true });
        VerificationPop.onDidDismiss(data => {
          this.navCtrl.pop();
        })
        VerificationPop.present();
      }
    });
  }

}
