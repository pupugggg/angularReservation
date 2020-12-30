import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CalComponent} from './cal/cal.component'
import {GuardGuard} from './guard.guard'
const routes: Routes = [
  {path:'cal',component:CalComponent},
  {path:'',redirectTo:'/cal',pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
