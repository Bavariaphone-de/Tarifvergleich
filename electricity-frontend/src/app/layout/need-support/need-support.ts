import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { Observable, map, tap } from 'rxjs';

@Component({
  selector: 'app-need-support',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './need-support.html',
  styleUrl: './need-support.css',
})
export class NeedSupport implements OnInit {
  // Define an Observable instead of a raw string variable
  contactNumber$!: Observable<string>;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    console.log('NeedSupport: Initializing stream');

    // Use RxJS pipes to transform the incoming data stream
    this.contactNumber$ = this.contentService.getData().pipe(
      tap((data) => console.log('NeedSupport: Data received', data)),
      map((data) => {
        const about = data?.menu?.about;
        if (about && about.length > 0) {
          const number = about[0].contactNumber ?? '';
          console.log('NeedSupport: Contact number extracted:', number);
          return number;
        }
        console.log('NeedSupport: No about data found');
        return '';
      }),
    );
  }
}
