import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FeatureComponent } from './feature/feature.component';
import { StepsComponent } from './steps/steps.component';
import { CompaniesComponent } from './companies/companies.component';
import AOS from 'aos';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FeatureComponent, StepsComponent, CompaniesComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 200,
      delay: 0,
      anchorPlacement: 'top-bottom',
      disable: false,
      mirror: false,
    });
  }

  /**
   * Redirigir al registro
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
