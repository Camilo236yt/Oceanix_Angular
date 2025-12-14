import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FeatureComponent } from './feature/feature.component';
import { StepsComponent } from './steps/steps.component';
import { CompaniesComponent } from './companies/companies.component';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { LandingChatbotComponent } from '../../shared/components/landing-chatbot/landing-chatbot.component';
import AOS from 'aos';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FeatureComponent, StepsComponent, CompaniesComponent, LoadingSpinner, LandingChatbotComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  isLoading = false;

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
   * Redirigir al registro con animación de carga
   */
  goToRegister(): void {
    this.isLoading = true;

    // Mostrar loading durante 800ms (duración estándar)
    setTimeout(() => {
      this.router.navigate(['/register']);
      this.isLoading = false;
    }, 800);
  }
}
