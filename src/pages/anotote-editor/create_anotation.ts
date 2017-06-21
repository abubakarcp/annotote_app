import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
    selector: 'create_anotation_popup',
    templateUrl: 'create_anotation.html',
})
export class CreateAnotationPopup {
    private selectedTxt: string;
    private comment: string;

    constructor(public params: NavParams, public viewCtrl: ViewController) {
        this.selectedTxt = this.params.get('selected_txt');
    }

    value_updating_comment(value) {
        this.comment = value;
    }

    done() {
        this.viewCtrl.dismiss({ status: true, comment: this.comment });
    }

    dismiss() {
        this.viewCtrl.dismiss({ status: false, comment: '' });
    }

}