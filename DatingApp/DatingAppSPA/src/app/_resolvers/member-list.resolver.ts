import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';

import { User } from '../_models/user';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// recordatorio los resolvers nos permiten cargar datos para un componente antes de que el componente se cargue
// para ello el resolver se asocia a la ruta de navegación que va cargar el componente
// de esta manera el resolver puede actuar de forma previa y proporcionar al component los datos que necesita.
@Injectable()
export class MemberListResolver implements Resolve<User[]>{
    // para dar soporte a la solicitud paginada incluimos aqui nuevas propiedades con los valores por defecto
    pageNumber = 1;
    pageSize   = 5;

    constructor(private userService: UserService,
                private router: Router,
                private alertify: AlertifyService){}

    resolve(route: ActivatedRouteSnapshot): Observable<User[]>{
        // incluimos las propiedades de paginación en la llamada de getUsers
        return this.userService.getUsers(this.pageNumber, this.pageSize).pipe(
            catchError(error => {
                this.alertify.error('problem retriving data');
                this.router.navigate(['/home']);
                return of(null);
            })
        );
    }
}

