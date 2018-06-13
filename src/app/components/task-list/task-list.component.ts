import { Component, OnInit, Input } from '@angular/core';
import { ActionService } from '../../services/action.service';
import { Publication } from '../../models/publications';
import { Router } from '@angular/router';

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  @Input() queja: Publication;

  constructor(
    private _actionService: ActionService,
    private _router: Router
  ) { }

  ngOnInit() {
  }

  onRelevance(event: any) {
    event.preventDefault();
    this._actionService.sendRelevance(this.queja.id_publication, !this.queja.user_relevance)
      .then((active: boolean) => {
        console.log(active);
        if (active) {
          this.queja.user_relevance = active;
        }
        else {
          this.queja.user_relevance = active;
        }
      })
      .catch((error) => console.log(error));
  }

  /**
   * MÉTODO PARA GEOLOCALIZAR LA QUEJA SELECCIONADA
   */
  geolocatePub(event: any) {
    event.preventDefault();
    //REF:
    this._router.navigateByUrl(
      this._router.createUrlTree(
        ['/mapview'],
        {
          queryParams: {
            pubId: this.queja.id_publication
          }
        }
      )
    );
  }

}
