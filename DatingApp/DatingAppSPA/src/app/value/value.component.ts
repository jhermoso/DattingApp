import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-value',
  templateUrl: './value.component.html',
  styleUrls: ['./value.component.css']
})
export class ValueComponent implements OnInit {
  values: any;
  // inject in the constructor the httpclient to connect with our Web APi server.
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getValues();
  }

  getValues() {
    this.http.get('http://localhost:5000/api/values').subscribe(response => { //36958
      this.values = response;
    }, error => {
        console.log(error);
    })
  }

}
