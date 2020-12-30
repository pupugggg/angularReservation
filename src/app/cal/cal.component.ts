import { Component, OnInit } from '@angular/core';
import { FormGroup,FormControl, Validators } from '@angular/forms';
import {ReservationService} from '../reservation.service';
import {AuthService} from '@auth0/auth0-angular';
import {
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  areIntervalsOverlapping
} from 'date-fns';
import { Subject } from 'rxjs';
import {take} from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import {colors} from '../colors';

@Component({
  selector: 'app-cal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cal.component.html',
  styleUrls: ['./cal.component.scss']
})
export class CalComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  eventForm=new FormGroup({
    title:new FormControl("",[Validators.required]),
    involvers:new FormControl("",[Validators.required]),
    description:new FormControl("",[Validators.required]),
    location:new FormControl("",[Validators.required])
  });
  selectedDate:FormControl;
  currentUserInfo:any;
  events:CalendarEvent[]/*=[{
    id:0,
    owner:"guy P",
    involvers:["guy P","王詠生"],
    description:"hello email",
    start: subDays(startOfDay(new Date()), 1),
    end: addDays(new Date(), 1),
    title: 'A 3 day event',
    color: colors.yellow,
    allDay: true,
    resizable: {
      beforeStart: true,
      afterEnd: true,
    },
    draggable: true,
   }]*/;
   eventFormValid:boolean=true;
   //todo 判斷結果邏輯 update 資料 12/29
  onEventFormSubmit(event:CalendarEvent):void{
    console.log(event);
    let locations:CalendarEvent[]=this.events.filter((e)=>e.location==this.eventForm.value.location && e!==event);
    console.log(locations);
    let flag:boolean=true;
    for(let i=0;i<locations.length;i++)
    {
      if(areIntervalsOverlapping({start:locations[i].start,end:locations[i].end},{start:event.start,end:event.end}))
      {
        flag=false;
        break;
      }
    }
    this.eventFormValid=flag;
    
    if(!flag){
      this.eventForm.setValue({location:"",description:"",involvers:""})
      return;
    }
    //todo spilt property
    let involversStr:string=this.eventForm.value["involvers"];
    event.location=this.eventForm.value["location"];
    event.description=this.eventForm.value["description"];
    event.involvers=this.eventForm.value["involvers"].split(",");
    event.involvers=event.involvers.filter((e)=>{return (e!=null && e!="");});
    event.title=this.eventForm.value["title"];
    console.log(event)
    this.reservationService.update(event).subscribe(()=>{this.refresh.next()
      this.eventForm.setValue({location:"",description:"",involvers:"",title:""})
    });
  }

  constructor(private reservationService:ReservationService,private modal: NgbModal ,public auth:AuthService) { 
    
  }

  ngOnInit(): void {
    this.getEvent();
    this.selectedDate=new FormControl(new Date(),[Validators.required]);
    this.auth.user$.subscribe(u=>{this.currentUserInfo=u;console.log(this.currentUserInfo);});
  }
  strToDate(event:CalendarEvent):CalendarEvent{
    return {
      ...event,
      start:new Date(event.start),
      end:new Date(event.end)
    } as CalendarEvent;
  }

  
  getEvent(){
    this.reservationService.get().subscribe(
      (res)=>
      {
        this.events=[];
        for(let i=0;i<res.length;i++)
        {
          this.events.push(
            this.strToDate(res[i])
          );
        }
        console.log(this.events);
        this.refresh.next();
      }
    );
  }
  
  view: CalendarView = CalendarView.Week;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  /*events: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'A 3 day event',
      color: colors.red,
      actions: this.actions,
      allDay: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      start: startOfDay(new Date()),
      title: 'An event with no end date',
      color: colors.yellow,
      actions: this.actions,
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'A long event that spans 2 months',
      color: colors.blue,
      allDay: true,
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'A draggable and resizable event',
      color: colors.yellow,
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
  ];*/

  activeDayIsOpen: boolean = true;

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    
    /*this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });*/
    event.start=newStart;
    event.end=newEnd;
    this.reservationService.update(event).subscribe(()=>{
      this.refresh.next();
    });
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent);
  }
  //todo 改成reservations style
  addEvent(): void {
    this.reservationService.add(  {
      title: 'New event',
      start: startOfDay(this.viewDate),
      end: endOfDay(this.viewDate),
      color: colors.red,
      draggable: true,
      resizable: {
      beforeStart: true,
      afterEnd: true,
      },
      owner:this.currentUserInfo.name,
      involvers:[this.currentUserInfo.name],
      description:"",
      location:"",
    } as CalendarEvent)
    .subscribe(
      (event)=>
      {
        this.events.push(this.strToDate(event));
        this.refresh.next();
      });
    /*this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(this.viewDate),
        end: endOfDay(this.viewDate),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];*/
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    //this.events = this.events.filter((event) => event !== eventToDelete);
    this.reservationService.delete(eventToDelete).subscribe(
    ()=>
    {
      this.events = this.events.filter((event) => event !== eventToDelete);
      console.log(this.events);
      this.refresh.next();
    });
  }
  //d
  setView(view: CalendarView) {
    this.view = view;
  }
  //d
  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

}
