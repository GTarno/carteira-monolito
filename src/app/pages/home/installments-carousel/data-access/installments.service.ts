import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InstallmentPlan } from '../models/installments.models';
import { INSTALLMENTS_MOCK } from './installments.mock';

@Injectable({
  providedIn: 'root'
})
export class InstallmentsService {
  getPlans(): Observable<InstallmentPlan[]> {
    return of(INSTALLMENTS_MOCK);
  }
}