import { Component, OnInit ,Inject} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-loginlogout',
  templateUrl: './loginlogout.component.html',
  styleUrls: ['./loginlogout.component.scss']
})
export class LoginlogoutComponent implements OnInit {

  constructor(@Inject(DOCUMENT) public document: Document,public auth:AuthService ) { }

  ngOnInit(): void {
    this.auth.isAuthenticated$.subscribe(b =>console.log(b));
  }

}
