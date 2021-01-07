import { Injectable } from '@angular/core';
import {InMemoryDbService} from 'angular-in-memory-web-api'
import {colors} from "./colors"

import { CalendarEvent} from 'angular-calendar';
import {startOfDay,addDays,addHours,} from 'date-fns';


//the simulated backend for frontend testing
@Injectable({
  providedIn: 'root'
})
export class InMemoryBackendService implements InMemoryDbService {
  

  createDb(){
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
  //generate id for idless record
  genId<T extends  CalendarEvent>(myTable: T[]): number {
    return myTable.length > 0 ? Math.max(...myTable.map(t => t.id)) + 1 : 0;
  }
  constructor() { }
}
