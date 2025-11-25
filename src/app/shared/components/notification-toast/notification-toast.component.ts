import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.css']
})
export class NotificationToastComponent implements OnInit {
  @Input() notification: any;
  @Output() dismissed = new EventEmitter<void>();
  @Output() clicked = new EventEmitter<void>();

  ngOnInit() {
    // Auto-dismiss after 5 seconds
    setTimeout(() => this.dismiss(), 5000);
  }

  navigateToIncident() {
    this.clicked.emit();
  }

  dismiss(event?: Event) {
    event?.stopPropagation();
    this.dismissed.emit();
  }
}
