import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-verification-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verification-banner.component.html',
  styleUrls: ['./verification-banner.component.scss']
})
export class VerificationBannerComponent implements OnInit, OnDestroy {
  // Property to control visibility of the banner
  showBanner = true;
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check initial route
    this.checkRoute(this.router.url);

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRoute(event.urlAfterRedirects);
      });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkRoute(url: string) {
    // Hide banner if we're on the verification page
    this.showBanner = !url.includes('/verificar-cuenta');
  }
}
