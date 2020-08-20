import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service' 

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
/*Aqui declaramos la propiedad de entrada (input)        *
 * que el componente padre utiliza para pasar los valores*/
  //@Input() valuesFromHome: any;
  @Output() cancelRegister = new EventEmitter();

  model: any = {};

  constructor(private authService: AuthService, private alertify: AlertifyService) { }

  ngOnInit(): void {
  }

  register() {
    //console.log(this.model);
    // ene ste punto es donde suscribimos a la devolución
    // del metodo post que invocamos desde auth.service 
    this.authService.register(this.model).subscribe(() => {
      this.alertify.success('registration succesful')
    }, error => {
        this.alertify.error(error);
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
    console.log('cancelled');
  }
}
