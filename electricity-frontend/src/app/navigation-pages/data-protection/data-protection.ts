import { Component } from '@angular/core';

@Component({
  selector: 'app-data-protection',
  imports: [],
  templateUrl: './data-protection.html',
  styleUrl: './data-protection.css',
})
export class DataProtection {

}

// import { Component, OnInit } from '@angular/core';
// // import { StaticContentService } from '../../services/static-content.service';
// // import { log } from 'console';
// import { CommonModule } from '@angular/common';


// @Component({
//   selector: 'app-data-protection',
//   imports: [CommonModule],
//   templateUrl: './data-protection.html',
//   styleUrls: ['./data-protection.css']
// })

// export class DataProtection implements OnInit {

  // content: any;

  // title: string = '';

  // constructor(private staticContentService: StaticContentService) {}

  // ngOnInit(): void {
  //   // this.getContent();
  //       this.staticContentService.getContentById(3).subscribe({
  //     next: (res) => {
  //       console.log(res.title)
  //       this.content = res;
  //       this.title = res.title;
  //       console.log(this.content)
  //     },
  //     error: (err: any) => {
  //       console.log(err);
  //     }
  //   });
  // }
  // }
