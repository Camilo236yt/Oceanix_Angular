import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureComponent } from './feature/feature.component';
import { StepsComponent } from './steps/steps.component';
import { CompaniesComponent } from './companies/companies.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FeatureComponent, StepsComponent, CompaniesComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

}
