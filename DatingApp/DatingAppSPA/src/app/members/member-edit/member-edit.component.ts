import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
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
  // en este punto volvemos a repetir el proceso de suscripción al behavieurSubject
  photoUrl: string;
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any){
    if (this.editForm.dirty){
      $event.returnValue = true;
    }
  }

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
    
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
  }

  updateUser() {
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

  // este es el metodo para actualizar en el componente padre
  // la foto principal
  updateMainPhoto(photoUrl) {
    this.user.photoUrl = photoUrl;
  }
}
