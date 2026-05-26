import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-about-us',
  imports: [CommonModule],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs implements OnInit {
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
