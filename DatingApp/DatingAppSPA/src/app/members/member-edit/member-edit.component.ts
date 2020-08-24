import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/_models/user';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/_services/user.service';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.scss']
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm', { static: true }) // decorador para acceder al estado del formulario. Necesita el import de @angular/core.
  editForm: NgForm;         // variable de tipo NgForm que nos permite acceder al formulario. Necesita el import de @angular/forms.

  user: User;

  constructor(
    private route: ActivatedRoute,
    private alertify: AlertifyService,
    private userService: UserService,
    private authService: AuthService
    ) { }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.user = data.user;
    });
  }

  updateUser(): void {
    this.userService
      .updateUser(this.authService.decodedToken.nameid, this.user)
      .subscribe(
        next => {
          this.alertify.success('Profile updated successfully');
          this.editForm.reset(this.user); // reseteamos el formulario para eliminar al advertencia de que hay cambios.
                                          // el reset sin parametros vacia el formulario.
                                          // para rellenarlo le ponemos como parametro el mismo objeto que hemos modificado.
        },
        error => {
          this.alertify.error(error);
        }
      );
  }


}
