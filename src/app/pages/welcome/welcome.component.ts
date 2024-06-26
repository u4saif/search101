import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { AppHttpService } from 'src/app/services/appHttpService';
import { SearchService } from 'src/app/services/searchService';
import { Constants } from 'src/app/utils/constant';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit, OnDestroy {
  @Output() resourceUpdated = new EventEmitter();
  constructor(
    public appService: AppHttpService,
    public searchService: SearchService,
    private message: NzMessageService,
    private route: Router
  ) {}
  resoureceList: any = [];
  currentpage: number = 1;
  isLoading: boolean = false;
  listType: string = 'SIMPLE';
  subscription: Subscription = new Subscription();

  ngOnInit() {
    const newKey = this.route.url.split("welcome/")[1];
    if(newKey) this.resourceUpdated.emit({key:newKey});
    this.subscription.add(
      this.searchService.getSearchState().subscribe(() => {
        this.searchOnChange();
      })
    );
  }
  changePageHandler(pageNo: any) {
    this.currentpage = pageNo;
    if (this.searchService.searchKey) this.searchOnChange(this.currentpage);
  }

  searchOnChange(pageNo = 1) {
    if (!this.searchService.searchKey) return;
    this.isLoading = true;
    const URL =
      Constants.API_BASE_URL +
      `${this.appService.currentActiveResouce.key}/${this.searchService.searchKey}/${pageNo}`;
    this.appService.get(URL).subscribe(
      (data: any) => {
        this.isLoading = false;

        if (data['error']) {
          this.message.create('error', `${data['error']}`);
        } else {
          this.resoureceList = data;
          this.listType = this.resoureceList.find((item: any) => item.Files)
            ? 'CONTAIN_FILE'
            : 'SIMPLE';
        }
        this.currentpage = pageNo;
      },
      (error) => {
        this.isLoading = false;
        this.message.create('error', `Somthing Went Wrong. `);
      }
    );
  }

  copyToClipBoard(value: any) {
    navigator.clipboard.writeText(value);
    this.message.create('success', `Magnet coppied!`);
  }

  markFavourite(item: any) {
    console.log(item);
    this.appService.postData(Constants.SEEDR_API_URL + `tor/add`, item).subscribe({
      next: (response) => this.message.create('success', `Added in favourite!`),
      error: (error) => this.message.create('error', `Error Occured!`),
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
