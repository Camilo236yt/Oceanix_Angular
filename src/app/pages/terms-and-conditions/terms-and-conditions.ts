import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-and-conditions.html',
  styleUrl: './terms-and-conditions.scss'
})
export class TermsAndConditions implements OnInit {
  ngOnInit(): void {
    // Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
