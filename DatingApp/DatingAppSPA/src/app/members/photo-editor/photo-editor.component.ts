import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Photo } from 'src/app/_models/photo';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls:  ['./photo-editor.component.scss']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];
  @Output() getMemberPhotoChange = new EventEmitter<string>(); // output property to update the main photo
  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  currentMain: Photo;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertify: AlertifyService
  ) {}

  ngOnInit() {
    this.initializeUploader();
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photos',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    // para evitar este Error: Response to preflight request doesn't pass acces control check: el valor del 'Access-control-allow-origin'
    // header in the response must not be the wildcare '*' when the request 's credentials mode is 'include' Origing 'http:/localhost:4200'
    // is therefor not allowed access. The credentials mode of request initiated by the XMLHttprquest is controled by the with credentials
    // attribute.
    //
    // que viene a decir que el Cors  => app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()); dentro de startup.cs
    // estamos diciendo que todo esta permitido pero que en esta petición concreta estamos solicitando unas credenciales.
    // las que se necesitan para acceder al api de Cloudinary. Lo que es una contradicción.
    // por tanto sobreescribimos la propiedad que exige las credenciales.
    this.uploader.onAfterAddingFile = file => {
      file.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const res: Photo = JSON.parse(response);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain
        };
        this.photos.push(photo);
        if (photo.isMain) {
          this.authService.changeMemberPhoto(photo.url);
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
        }
      }
    };
  }

  setMainPhoto(photo: Photo) {
    this.userService
      .setMainPhoto(this.authService.decodedToken.nameid, photo.id)
      .subscribe(
        () => {
          this.currentMain = this.photos.filter(p => p.isMain === true)[0];
          this.currentMain.isMain = false;
          photo.isMain = true;
          // update the main photo with the ouput property
          // el orden es importante.
          // this.getMemberPhotoChange.emit(photo.url);

          // cambiamos el anterior metodo con una output property 
          // por el metodo de actualización con beheavieurSubject
          this.authService.changeMemberPhoto(photo.url);
          this.authService.currentUser.photoUrl = photo.url;

          // actualizamos el local storage con el valor de la foto
          // con objeto de que la actualización de la pagina mantenga el valor de la foto.
          localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  deletePhoto(id: number) {
    this.alertify.confirm('Are you sure you want to delete this photo?', () => {
      this.userService
        .deletePhoto(this.authService.decodedToken.nameid, id)
        .subscribe(
          () => {
            this.photos.splice(this.photos.findIndex(p => p.id === id), 1);
            this.alertify.success('Photo has been deleted');
          },
          error => {
            this.alertify.error('Failed to delete the photo');
          }
        );
    });
  }
}
