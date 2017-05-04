import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { Login } from '../pages/login/login';
import { Signup } from '../pages/signup/signup';
import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { Profile } from '../pages/follows/follows_profile';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { Home } from '../pages/home/home';
import { Settings } from '../pages/home/settings';
import { AnototeOptions } from '../pages/anotote-detail/tote_options';
import { TopInterests } from '../pages/home/top_interests';
import { TopOptions} from '../pages/home/top_options';
import { Notifications } from '../pages/notifications/notifications';
import { Follows } from '../pages/follows/follows';
import { AnototeList } from '../pages/anotote-list/anotote-list';
import { AnototeDetail } from '../pages/anotote-detail/anotote-detail';
import { AnototeEditor } from '../pages/anotote-editor/anotote-editor';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    Login,
    Signup,
    Home,
    Follows,
    Profile,
    Notifications,
    HelloIonicPage,
    ItemDetailsPage,
    AnototeOptions,
    ListPage,
    Settings,
    TopOptions,
    TopInterests,
    AnototeList,
    AnototeDetail,
    AnototeEditor
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Login,
    Signup,
    Home,
    Follows,
    Profile,
    Settings,
    TopOptions,
    TopInterests,
    Notifications,
    HelloIonicPage,
    ItemDetailsPage,
    AnototeOptions,
    ListPage,
    AnototeList,
    AnototeDetail,
    AnototeEditor
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
