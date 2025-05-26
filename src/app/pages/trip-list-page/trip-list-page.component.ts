import { Component } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { ApiClientService } from '../../services/api-client.service';
import { TripResponse } from '../../models/trip-response';
import {formatMilliseconds} from "../../helpers/formatting-helper";
import {formatDistance} from "date-fns";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCaretLeft, faCaretRight, faEllipsisVertical, faListDots} from "@fortawesome/free-solid-svg-icons";
import {NgClass} from "@angular/common";
import {ButtonComponent} from "../../components/button/button.component";
import {PaginatedList} from "../../models/paginated-list";
import {PageSelectButtonComponent} from "../../components/page-select-button/page-select-button.component";

@Component({
  selector: 'app-trip-list-page',
  standalone: true,
  imports: [RouterLink, FaIconComponent, NgClass, ButtonComponent, PageSelectButtonComponent],
  templateUrl: './trip-list-page.component.html',
})
export class TripListPageComponent {
  tripList: PaginatedList<TripResponse> | null = null;

  itemsPerPage = 10;
  currentPage = 0;

  getTotalPages() : number {
    if (this.tripList == null) {
      return 0;
    }

    return Math.ceil(this.tripList.count / this.itemsPerPage);
  }

  getPageButtonNumbers(): number[] {
    if (!this.tripList) return [];

    const totalPages = this.getTotalPages();
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    let start = this.currentPage - 2;
    let end = this.currentPage + 2;

    if (start < 0) {
      end += -start;
      start = 0;
    }

    if (end >= totalPages) {
      const shift = end - totalPages + 1;
      start = Math.max(0, start - shift);
      end = totalPages - 1;
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }



  goToPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page, }, // your params
      queryParamsHandling: 'merge', // 'merge' to keep existing, 'preserve' to keep all
    });
  }

  constructor(public httpApiClient: ApiClientService, private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {

      if (this.tripList)
        this.tripList.items = [];

      this.currentPage = parseInt(params['page'] ?? 0);

      httpApiClient.getTrips(this.itemsPerPage, this.itemsPerPage * this.currentPage).subscribe((response) => {
        this.tripList = response;
      })
    })
  }

  getLength(trip: TripResponse): number {
    return new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
  }

  getTimeAgo(trip: TripResponse) {
    return formatDistance(new Date(trip.startDate), new Date(), {addSuffix: true});
  }

  protected readonly formatMilliseconds = formatMilliseconds;
  protected readonly faListDots = faListDots;
  protected readonly faEllipsisVertical = faEllipsisVertical;
  protected readonly faCaretLeft = faCaretLeft;
  protected readonly faCaretRight = faCaretRight;
}
