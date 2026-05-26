import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { Observable, map, tap } from 'rxjs';

@Component({
  selector: 'app-contact-person',
  standalone: true, // Ensuring it's standalone like your other component
  imports: [CommonModule], // Required for the async pipe
  templateUrl: './contact-person.html',
  styleUrl: './contact-person.css',
})
export class ContactPerson implements OnInit {
  // Define the Observable stream for the contact person data
  contactPerson$!: Observable<any>;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    console.log('ContactPerson: Initializing stream');

    this.contactPerson$ = this.contentService.getData().pipe(
      tap((data) => console.log('ContactPerson: Data received', data)),
      map((data) => {
        const about = data?.menu?.about;
        if (about && about.length > 0) {
          // Grabs the first about object (adjust properties like 'name' or 'role' as needed)
          console.log('ContactPerson: Extracted contact person details', about[0]);
          return about[0];
        }
        console.log('ContactPerson: No contact person data found');
        return null;
      }),
    );
  }
}
