import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'dashy-storage-bar',
  templateUrl: './storage-bar.component.html',
  styleUrls: ['./storage-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StorageBarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
