import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-contact-person',
  imports: [CommonModule],
  templateUrl: './contact-person.html',
  styleUrl: './contact-person.css',
})
export class ContactPerson implements OnInit {
  aboutData: any = null;

  constructor(
    public contentService: ContentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.contentService.getAbout().subscribe((data) => {
      if (data && data.length > 0) {
        this.aboutData = data[0];
        this.cdr.detectChanges(); // Force UI to update immediately
      }
    });
  }
}
