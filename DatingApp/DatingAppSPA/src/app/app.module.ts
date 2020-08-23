import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';

import { AppComponent } from './app.component';
// import { ValueComponent } from './value/value.component';
import { NavComponent } from './nav/nav.component';
import { AuthService } from './_services/auth.service';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { ErrorInterceptorProvider } from './_services/error.interceptor';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MemberCardComponent } from './members/member-card/member-card.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
// import { AlertifyService} from './_services/alertify.service'
import { appRoutes } from './routes';


// copied from https://github.com/auth0/angular2-jwt usage injection
export function tokenGetter(): string | null {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    // ValueComponent,
    NavComponent,
    HomeComponent,
    RegisterComponent,
    MemberListComponent,
    ListsComponent,
    MessagesComponent,
    MemberCardComponent,
    MemberDetailComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    JwtModule.forRoot({
    config: {
      tokenGetter,
      allowedDomains: ['localhost:5000'],
      disallowedRoutes: ['localhost:5000/api/auth/']
      }
    })
  ],
  providers: [
    AuthService,
    ErrorInterceptorProvider,
    MemberDetailResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
