import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { MemberEditComponent } from '../members/member-edit/member-edit.component';

// Consider using this interface for all CanDeactivate guards,
// and have your components implement this interface, too.
//
//   e.g. export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
//
// export interface CanComponentDeactivate {
// canDeactivate: () => any;
// }

@Injectable({providedIn: 'root'})
export class PreventUnsavedChanges implements CanDeactivate<MemberEditComponent> {
    canDeactivate(
        component: MemberEditComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot
    ): Observable<boolean>|Promise<boolean>|boolean {
        if (component.editForm.dirty){
            return confirm('Are you sure you want to continue. Any unsaved changes will be lost.' );
        }

        return true;
    }
}