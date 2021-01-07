import { Injectable } from '@angular/core';
//line below is for testing
//import {InMemoryBackendService} from './in-memory-backend.service'
import {HttpClient,HttpHeaders} from "@angular/common/http"
import {Observable,of} from 'rxjs'
import {catchError} from "rxjs/operators"
import{CalendarEvent} from 'angular-calendar'
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  //backend address
  dataUrl:string=/*"api/events"*/"http://123.193.99.181:25565/events";
  constructor(private httpClient:HttpClient) { }
  //get event
  get():Observable<CalendarEvent[]>{
    return this.httpClient.get<CalendarEvent[]>(this.dataUrl)
    .pipe(
      catchError(this.handleError<CalendarEvent[]>('getEvents',[]))
    );
    
  }
  //get event by location
  getByLocation(location:string):Observable<CalendarEvent[]>{
    if(!location.trim())
      return of([]);
    else
      return this.httpClient.get<CalendarEvent[]>(this.dataUrl+`?location=${location}`)
        .pipe(
        catchError(this.handleError<CalendarEvent[]>('getEvents',[]))
      );
    
  }
  //add new event
  add(reservation:CalendarEvent):Observable<CalendarEvent>{
    return this.httpClient.post<CalendarEvent>(this.dataUrl,reservation,this.httpOptions).pipe(
      catchError(this.handleError<CalendarEvent>('addEvent'))
    );
  }
  //update event
  update(reservation:CalendarEvent):Observable<CalendarEvent>{
    return this.httpClient.put<CalendarEvent>(this.dataUrl,reservation,this.httpOptions).pipe(
      catchError(this.handleError<CalendarEvent>('updateEvent'))
    );
  }
  //delete event
  delete(event:CalendarEvent):Observable<CalendarEvent>{
    return this.httpClient.delete<CalendarEvent>(this.dataUrl+`/${event.id}`,this.httpOptions).pipe(
      catchError(this.handleError<CalendarEvent>('deleteEvent'))
    );
  }
  //send emails to backend
  sentEmailToSever(emails:String[],event:CalendarEvent):Observable<any>{
    return this.httpClient.post("http://123.193.99.181:25565/email",{emails:emails,event:event},this.httpOptions).pipe(
      catchError(this.handleError<string[]>("sendEmail"))
    );
  }
  // error handler
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      console.error(error); // log to console instead
  
      console.log(`${operation} failed: ${error.message}`);
  
      return of(result as T);
    };
  }
}
