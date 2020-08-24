import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/_models/user';
import {NgxGalleryImage, NgxGalleryOptions, NgxGalleryAnimation} from '@kolkov/ngx-gallery';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss']
})
export class MemberDetailComponent implements OnInit {
  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(
    private userService: UserService,
    private alertify: AlertifyService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.loadUser();
    this.route.data.subscribe(data => {
      this.user = data.user;
    });

    this.galleryOptions = [{
      width: '500px',
      height: '500px',
      imagePercent: 100,
      thumbnailsColumns: 4,
      imageAnimation: NgxGalleryAnimation.Slide,
      preview: false
    }];

    this.galleryImages = this.getImages();
  }

  getImages(): any[] {
    const imageUrls = [];
/*     this.user.photos.forEach(photo => {
      imageUrls.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url,
        description: photo.description
      });
    }); */

/*     for (const photo of this.user.photos ){
      imageUrls.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url,
        description: photo.description
      });
    } */

    for (let i = 0; i < this.user.phothos.length; i++) {
      imageUrls.push({
        small: this.user.phothos[i].url,
        medium: this.user.phothos[i].url,
        big: this.user.phothos[i].url,
        description: this.user.phothos[i].description
      });
    }

    return imageUrls;
  }

  // members/4
  /*
     loadUser(): void{
    // get user devuelve un obserbable por esa razón nos debemos suscribir
    this.userService.getUser(+this.route.snapshot.params['id']).subscribe((user: User) => {
      this.user = user;
      }, error => {
        this.alertify.error(error);
      });
    }
  */
}
