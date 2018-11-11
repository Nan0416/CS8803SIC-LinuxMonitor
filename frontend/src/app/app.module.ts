import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import {RouterModule, Route, UrlSegment} from '@angular/router';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
// google material
import {MatButtonModule} from '@angular/material/button';
// self defined component
import { MonitorComponent } from './monitor/monitor.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserPageComponent } from './user-page/user-page.component';
import { TargetComponent } from './target/target.component';
import { TargetDetailComponent } from './target-detail/target-detail.component';

// router

export function metaListMatcher(url: UrlSegment[]) {
 
  if(
    (url.length === 2 && url[0].path === 'meta') ||
    (url.length === 3 && url[0].path === 'meta')){
    return {consumed: url};
  }else{
    return null;
  }
}
export function contentListMatcher(url: UrlSegment[]){
  const metaFields = ['list', 'search', 'category', 'pornstar', 'studio', 'director'];
  const sort = ['view', 'releaseDate', 'rating', 'duration', 'favorite'];
  if(url.length === 0 || 
     (url.length >= 2 && metaFields.indexOf(url[0].path) !== -1)){
    return {consumed:url};
  }else{
    return null;
  }
}
export function watchLaterMatcher(url: UrlSegment[]){
  // xxx.xxx.xxx/watchlater
  if(url.length > 0 && url[0].path === 'watchlater'){
    return {consumed:url};
  }else{
    return null;
  }
}
const routes: Route[]=[
  { path: "monitor", component: MonitorComponent},
  { path: "monitor/:name", component: TargetDetailComponent},
  { path: "login", component: LoginPageComponent},
  { path: "targets", component: TargetComponent},
  { path: "user", component: UserPageComponent},
  /*{ matcher: watchLaterMatcher, component: NotFoundComponent},*/
  { path: "**", component: NotFoundComponent}
];



@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    MonitorComponent,
    LoginPageComponent,
    UserPageComponent,
    TargetComponent,
    TargetDetailComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    HttpClientModule,
    MatButtonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
