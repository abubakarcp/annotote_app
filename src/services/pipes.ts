import { Pipe, PipeTransform } from "@angular/core";
import { AuthenticationService } from "./auth.service";
import { Constants } from "./constants.service";
import { DatePipe } from "@angular/common";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({
  name: "chatHeads"
})
export class ChatHeads {
  constructor(public auth: AuthenticationService) { }

  transform(input) {
    let user = this.auth.getUser();
    if (input.senderId == user.id) {
      return "assets/img/check-green.png";
    } else if (input.read == 0) {
      return "assets/img/check-red.png";
    } else {
      return "assets/img/checkYellow.png";
    }
  }
}

@Pipe({
  name: "chat_name"
})
export class chatName {
  constructor(public auth: AuthenticationService) { }

  transform(input) {
    let user = this.auth.getUser();
    if (input[0].user.id != user.id) return input[0].user.firstName;
    else return input[1].user.firstName;
  }
}

@Pipe({
  name: "image_base_path"
})
export class basePath {
  constructor(public constants: Constants) { }

  transform(input) {
    var url = this.constants.IMAGE_BASEURL + "/" + input;
    return url;
  }
}

@Pipe({
  name: "time_stamp"
})
export class timeStamp {
  constructor(public date: DatePipe) { }

  transform(input) {
    var formated_time = new Date(input * 1000);
    var timeDiff = Math.abs(new Date().getTime() - formated_time.getTime());
    var difference = timeDiff / (1000 * 3600 * 24);
    var today_or_tomorrow = difference < 1 ? true : false;
    if (today_or_tomorrow)
      return this.date.transform(formated_time, "shortTime");
    else {
      if (formated_time.getFullYear() == new Date().getFullYear())
        return this.date.transform(formated_time, "MM/dd");
      else return this.date.transform(formated_time, "yyyy/MM/dd");
    }
  }
}

@Pipe({
  name: "notificationTimeStamp"
})
export class notificationTime {
  constructor(public date: DatePipe) { }

  transform(input) {
    var formated_time = new Date(input * 1000);
    var today = new Date();
    if (today.getDate() == formated_time.getDate())
      return this.date.transform(formated_time, "shortTime");
    else return this.date.transform(formated_time, "MM/dd");
  }
}

@Pipe({
  name: "sanitizeHtml"
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) { }

  transform(v: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}

let loadJsURL = function (url: string) {

  // let canJsLoad = function (url: string) {
  //   if (!url) return false;
  //   let scripts = document.getElementsByTagName('script');
  //   for (var i = scripts.length; i--;) {
  //     // *td
  //     // better with substring or pos, make work with //
  //     document.appendChild(scripts[i]);
  //   }
  //   return true;
  // }


  // // Load js url
  // let insertJsUrl = function (url: string) {
  //   var script = document.createElement('script');
  //   script.setAttribute('src', url);
  //   document.body.appendChild(script);
  // }

  // if (canJsLoad(url)) {
  //   insertJsUrl(url)
  // }
}


@Pipe({ name: 'checkScripts' })
export class CheckScriptsPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {
  }
  transform(value: string) {
    // let jsUrls = value.match(/(\/\/.+\..+\/.+\.js)/g);
    let jsUrls = value.match(/<script[\s\S]*?>[\s\S]*?<\/script>/gi);

    // if (jsUrls && jsUrls.length) {
    //   for (let url of jsUrls) {
    //     loadJsURL(url)
    //   }
    // }
    // let scripts = document.getElementsByTagName('script');
    for (var i = jsUrls.length; i--;) {
      //loading all scripts of html page
      var url = jsUrls[i].match(/(\/\/.+\..+\/.+\.js)/g);
      if (url != null) {
        var script = document.createElement('script');
        script.setAttribute('src', 'https:' + url[0]);
        document.body.appendChild(script);
      }
      // var script = document.createElement(jsUrls[i]);
      // console.log(script);
      // document.body.appendChild(jsUrls[i]);
    }

    return value;
  }
}

@Pipe({
  name: "frameHtml"
})
export class Frame implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) { }

  transform(v: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustResourceUrl(v + "?random=" + (new Date()).getTime() + Math.floor(Math.random() * 1000000));
  }
}

@Pipe({
  name: "chatVoteOptions"
})
export class chatVote {
  constructor(public auth: AuthenticationService) { }

  transform(groupUsers) {
    var contains = false;
    groupUsers.forEach(element => {
      if (element.user.id == this.auth.getUser().id) {
        contains = true;
      }
    });
    return contains;
  }
}

@Pipe({
  name: "boldTags"
})
export class Bold implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) { }

  transform(highlight) {
    if (highlight.comment != null) {
      var total = highlight.comment.split(" ");
      var result = "";
      var index = 0;
      for (let word of total) {
        // var temp = word.split("\\r?\\n");
        if (word[0] == "#") {
          result += "<b>" + word + "</b> ";
          index++;
        } else if (word[0] == "`") {
          var jug = highlight.comment.split("`");
          for (let water of jug) {
            if (water[0] == "@") {
              result += "<b>" + water + "</b> ";
              index++;
              break;
            }
          }
        } else if (word[0] == "$") {
          result += "<b>" + word + "</b> ";
          index++;
        } else if (word[0] == "^") {
          result += '<b id="' + index + '">' + word + "</b> ";
          index++;
        } else if (word[word.length - 1] != "`") result += word + " ";
      }
      this._sanitizer.bypassSecurityTrustStyle(result);
      return this._sanitizer.bypassSecurityTrustHtml(result);
    } else {
      return "";
    }
  }
}
