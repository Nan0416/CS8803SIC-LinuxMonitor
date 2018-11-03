import { Component, OnInit } from '@angular/core';
import { UserOperationService } from '../services/user-operation.service';
import {Router , NavigationEnd} from '@angular/router';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(
    private userOperator: UserOperationService,
    private router: Router
  ) { }
  isLoginPage:boolean = true;
  id:string = ""; // username or email address;
  password: string = ""; // password
  error: string = null;

  username: string="";
  email: string="";
  password_1: string = "";
  password_2: string = "";
  signup_error: string = null;

  ngOnInit() {
    
  }
  
  login(){
    this.error = null;
    this.userOperator.login(this.id, this.password).subscribe(data=>{
      if(data){
        this.router.navigate(["/"]);
      }else{
        //show err
        this.error = "Invalid username or password";
      }
    });
  }


  gotoSignup(){
    this.isLoginPage = false;
  }
  validateUsername(username){
    // 6 - 20 char from [0-9, a-z, A-Z]
    if(typeof username === "string"){
        if(username.length >= 6 && username.length <= 20){
            for (let i = 0; i < username.length; i++) {
                if((username.charAt(i) >= '0' && username.charAt(i) <= '9') || 
                    (username.charAt(i) >= 'a' && username.charAt(i) <= 'z') || 
                    (username.charAt(i) >= 'A' && username.charAt(i) <= 'Z'))
                {
                        
                }else{
                    return "Character in username must come from 0-9, a-z or A-Z";
                }
            }
            return "OK";
        }
        return "Username's length should from 6 to 20"
    }
    return "Invalid username";
}
validatePassword(password){
    let az = /[a-z]/;
    let AZ = /[A-Z]/;
    //let n09 = /[0-9]/;
    if(typeof password === "string"){
        if(password.length >= 8 && password.length <= 40){
            let valid = 0;
            if(az.test(password)){
                valid++;
            }
            if(AZ.test(password)){
                valid++;
            }
            /*if(n09.test(password)){
                valid++;
            }*/
            if(valid >= 2){
                return "OK";
            }
            return "Password must contain at least one lowercase and one uppercase character";
        }
        return "Password's length should from 8 to 40";
    }
      return "Invalid password";
  }
  validateEmail(email):boolean {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }
  
  signup(){
    this.signup_error = null;
    if(this.userOperator.user !== null){
      this.signup_error = "You already login";
      return;
    }
    if(this.password_1 !== this.password_2){
      this.signup_error = "Please make sure you enter the same password";
      return;
    }
    if(this.validateUsername(this.username) !== "OK"){
      this.signup_error = "Invalid username";
      return;
    }
    if(this.validatePassword(this.password_1) !== "OK"){
      this.signup_error= "Invalid password";
      return;
    }
    if(!this.validateEmail(this.email)){
      this.signup_error = "Invalid email";
      return;
    }
    
    this.userOperator.signup(this.username, this.email, this.password_1).subscribe(user=>{
      if(user !== null){
        // success
        this.router.navigate(["/user"]);
      }else{
        this.signup_error = "Username or email is already registered."
      }
    });
  }

}

