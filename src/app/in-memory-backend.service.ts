import { Injectable } from '@angular/core';
import {InMemoryDbService} from 'angular-in-memory-web-api'
import {colors} from "./colors"

import { CalendarEvent,CalendarEventAction } from 'angular-calendar';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class InMemoryBackendService implements InMemoryDbService {
  

  createDb(){
    /*const reservations=[
      {id:0,reserver:"guy P",involvers:["guy P","王詠生"],description:"hello email",cEvent:     
       {
        start: subDays(startOfDay(new Date()), 1),
        end: addDays(new Date(), 1),
        title: 'A 3 day event',
        color: colors.red,
        allDay: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
        draggable: true,
      }},
      {id:1,reserver:"guy P",involvers:["guy P","王詠生"],description:"hello email",cEvent:    
       {
        start: startOfDay(new Date()),
        title: 'An event with no end date',
        color: colors.yellow,
      }},
      {id:2,reserver:"guy P",involvers:["guy P","王詠生"],description:"hello email",cEvent:{
        
          start: subDays(endOfMonth(new Date()), 3),
          end: addDays(endOfMonth(new Date()), 3),
          title: 'A long event that spans 2 months',
          color: colors.blue,
          allDay: true,
        
      }},
      {id:3,reserver:"guy P",involvers:["guy P","王詠生"],description:"hello email",cEvent:{
        start: addHours(startOfDay(new Date()), 2),
        end: addHours(new Date(), 2),
        title: 'A draggable and resizable event',
        color: colors.yellow,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
        draggable: true,
      }},
    ]
    return {reservations};*/
    const events=[
    {
      id:0,
      owner:"guy P",
      involvers:["guy P","王詠生"],
      description:"hello email",
      start: addDays(startOfDay(new Date()), 1),
      end: addHours( addDays(new Date(),1), 2),
      title: 'A 3 day event',
      color: colors.yellow,
      allDay: false,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
      location:"TR-313"
     },
    {
      id:1,
      owner:"王詠生",
      involvers:["guy P","王詠生"],
      description:"hello email",
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'A draggable and resizable event',
      color: colors.yellow,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
      location:"TR-312"
    },
    ]
    return {events};
  }
  genId<T extends  CalendarEvent>(myTable: T[]): number {
    return myTable.length > 0 ? Math.max(...myTable.map(t => t.id)) + 1 : 0;
  }
  constructor() { }
}
