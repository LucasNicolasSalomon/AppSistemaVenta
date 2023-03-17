import { Injectable } from '@angular/core';

import{HttpClient} from "@angular/common/http";
import{Observable} from "rxjs";
import { environment } from 'src/environments/environment';
import { ResponseApi } from '../Interfaces/response-api';
import { Venta } from '../Interfaces/venta';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private urlApi:string = environment.endpoint + "Venta/";

  constructor(private Http:HttpClient) {}

  registrar(request: Venta):Observable<ResponseApi>{

    return this.Http.post<ResponseApi>(`${this.urlApi}Registrar`,request)

  }

  historial(bucarPor: string, numeroVenta: string, fechaInicio: string, fechaFin: string):Observable<ResponseApi>{

    return this.Http.get<ResponseApi>(`${this.urlApi}Historial?buscarPor=${bucarPor}&numeroVenta=${numeroVenta}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)

  }

  reporte(fechaInicio: string, fechaFin: string):Observable<ResponseApi>{

    return this.Http.get<ResponseApi>(`${this.urlApi}Reporte?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)

  }
}
