import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-account',
  imports: [
    MatInputModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    RouterModule
],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {
  aboutData: any = null;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contentService: ContentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.contentService.getAbout().subscribe((data) => {
      if (data && data.length > 0) {
        this.aboutData = data[0];
        this.cdr.detectChanges();
      }
    });
  }

  openPage() {
    this.router.navigate(['/electricity-comparision/checkout'], {});
  }
}
