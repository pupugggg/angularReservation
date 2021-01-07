import { Component, OnInit } from '@angular/core';
import { FormGroup,FormControl, Validators } from '@angular/forms';
import {ReservationService} from '../reservation.service';
import {AuthService} from '@auth0/auth0-angular';
import {ChangeDetectionStrategy, ViewChild, TemplateRef,} from '@angular/core';
import {startOfDay,endOfDay,isSameDay,isSameMonth,areIntervalsOverlapping} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {CalendarEvent,CalendarEventAction,CalendarEventTimesChangedEvent,CalendarView,} from 'angular-calendar';
import {colors} from '../colors';

//decorator for angular componet
@Component({
  selector: 'app-cal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cal.component.html',
  styleUrls: ['./cal.component.scss']
})
export class CalComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  
  //formGroup for event detail
  eventForm=new FormGroup({
    title:new FormControl("",[Validators.required]),
    involvers:new FormControl("",[Validators.required]),
    description:new FormControl("",[Validators.required]),
    location:new FormControl("",[Validators.required])
  });
  eventFormValid:boolean=true

  //elements relate to sending email
  emailForm=new FormGroup({email:new FormControl("",[Validators.email,Validators.required])});
  emails:string[]=[];
  //variable for storing the CalendarEventData
  events:CalendarEvent[]

  //user state
  currentUserInfo:any=null;

  //set view to week
  view: CalendarView = CalendarView.Week;

  CalendarView = CalendarView;
  //set view date to current date
  viewDate: Date = new Date();
  //encapsaul of eventdata
  modalData: {
    action: string;
    event: CalendarEvent;
  };
  //the action callback
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
  //handler to refreshing event view
  refresh: Subject<any> = new Subject();
  //
  activeDayIsOpen: boolean = true;

  //change event details
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
      this.eventForm.setValue({location:"",description:"",involvers:"",title:""})
      return;
    }
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
  //operation for candidate of email sendee
  addEmail(){
    console.log(this.emailForm.value["email"])
    this.emails.push(this.emailForm.value["email"]);
  }
  popEmail(){
    if(!this.emails){return;}
    this.emails.pop();
  }
  sendEmail(event:CalendarEvent){
    this.reservationService.sentEmailToSever(this.emails,event).subscribe(()=>{
      this.emailForm.setValue({email:""});
      this.emails=[];
    })
  }

  //contructor for initialize service to get data from remote database
  constructor(private reservationService:ReservationService,private modal: NgbModal ,public auth:AuthService) { 
    
  }
  //init
  ngOnInit(): void {
    this.auth.user$.subscribe(u=>{this.currentUserInfo=u;console.log(this.currentUserInfo);this.getEvent();});
    
  }
  //parse string into type 'Date'
  strToDate(event:CalendarEvent):CalendarEvent{
    return {
      ...event,
      start:new Date(event.start),
      end:new Date(event.end)
    } as CalendarEvent;
  }
  //set event permission to read only
  setEventPermission(event:CalendarEvent):CalendarEvent{
    if(this.currentUserInfo==null||this.currentUserInfo.name==null||this.currentUserInfo.name!=event.owner)
    {
      return {
        ...event,
      draggable:false,
      resizable: {
        beforeStart: false,
        afterEnd: false,
      },
      color:colors.blue
      }
    }
    return event;
  }
  //get event from service
  getEvent(){
    this.reservationService.get().subscribe(
      (res)=>
      {
        console.log(res);
        this.events=[];
        for(let i=0;i<res.length;i++)
        {
          this.events.push(
            //res[i]
            this.setEventPermission(this.strToDate(res[i]))
          );
        }
        console.log(this.events);
        this.refresh.next();
      }
    );
  }
  

  //day clicked event callback
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
  //callback when event time is changed on the view
  eventTimesChanged({event,newStart,newEnd,}: CalendarEventTimesChangedEvent): void {
    let sameLocEvent=this.events.filter((ievent)=>{return ((ievent.location===event.location)&&!(ievent==event))});
    console.log(sameLocEvent);
    for(let i=0;i<sameLocEvent.length;i++)
    {
      if(areIntervalsOverlapping({start:sameLocEvent[i].start,end:sameLocEvent[i].end},{start:newStart,end:newEnd}))
      {
        console.log("event overlap!");
        return;
      }
    }

    event.start=newStart;
    event.end=newEnd;
    
    this.reservationService.update(event).subscribe(()=>{
      this.refresh.next();
    });
  }
  //event handler
  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent);
  }
  //add new event to the view
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
  }
  //delete event from view
  deleteEvent(eventToDelete: CalendarEvent) {
    this.reservationService.delete(eventToDelete).subscribe(
    ()=>
    {
      this.events = this.events.filter((event) => event !== eventToDelete);
      console.log(this.events);
      this.refresh.next();
    });
  }
}
