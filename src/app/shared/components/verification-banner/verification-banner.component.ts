import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verification-banner.component.html',
  styleUrls: ['./verification-banner.component.scss']
})
export class VerificationBannerComponent {
  // Property to control visibility of the banner
  showBanner = true; // Set to true to always show for now (no functionality)
}
