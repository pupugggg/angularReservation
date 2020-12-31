import { Injectable } from '@angular/core';
import {InMemoryBackendService} from './in-memory-backend.service'
import {HttpClient,HttpHeaders} from "@angular/common/http"
import {Observable,of} from 'rxjs'
import {catchError,map,tap} from "rxjs/operators"
import{CalendarEvent} from 'angular-calendar'
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  //"http://123.193.99.181:25565/reserve"
  dataUrl:string=/*"api/events"*/"http://123.193.99.181:25565/events";
  constructor(private httpClient:HttpClient) { }
  get():Observable<CalendarEvent[]>{
    return this.httpClient.get<CalendarEvent[]>(this.dataUrl)
    .pipe(
      catchError(this.handleError<CalendarEvent[]>('getEvents',[]))
    );
    
  }
  getByLocation(location:string):Observable<CalendarEvent[]>{
    if(!location.trim())
      return of([]);
    else
      return this.httpClient.get<CalendarEvent[]>(this.dataUrl+`?location=${location}`)
        .pipe(
        catchError(this.handleError<CalendarEvent[]>('getEvents',[]))
      );
    
  }
  add(reservation:CalendarEvent):Observable<CalendarEvent>{
    return this.httpClient.post<CalendarEvent>(this.dataUrl,reservation,this.httpOptions).pipe(
      catchError(this.handleError<CalendarEvent>('addEvent'))
    );
  }

  update(reservation:CalendarEvent):Observable<CalendarEvent>{
    return this.httpClient.put<CalendarEvent>(this.dataUrl,reservation,this.httpOptions).pipe(
      catchError(this.handleError<CalendarEvent>('updateEvent'))
    );
  }
  delete(event:CalendarEvent):Observable<CalendarEvent>{
    return this.httpClient.delete<CalendarEvent>(this.dataUrl+`/${event.id}`,this.httpOptions).pipe(
      catchError(this.handleError<CalendarEvent>('deleteEvent'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
