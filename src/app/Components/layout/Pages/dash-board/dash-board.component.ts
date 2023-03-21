import { StickyDirection } from '@angular/cdk/table';
import { Component , OnInit} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashBoardService } from 'src/app/Services/dash-board.service';
Chart.register(...registerables);

@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.css']
})
export class DashBoardComponent implements OnInit{

  totalIngresos: string = "0";
  totalVentas: String = "0";
  totalProductos: String = "0";

  constructor(
    private _dashboardServicio: DashBoardService
  ){}
  mostarGrafico(labelGrafico: any[],dataGrafico:any[]){

    const chartBarras = new Chart('chartBarras',{
      type: "bar",
      data: {
        labels: labelGrafico,
        datasets: [{
          label: "# de Ventas",
          data: dataGrafico,
          backgroundColor:[
            'rgba(54,162,235,0.2)'
          ],
          borderColor:[
            'rgba(54,162,235,1)'
          ]
        }],
      },
      options:{
        maintainAspectRatio: false,
        responsive: true,
        scales:{
          y:{
            beginAtZero: true
          }
        }
      }
    });

  }
  ngOnInit(): void {

    this._dashboardServicio.resumen().subscribe({
      next: (data) =>{
        if(data.status){
          this.totalIngresos = data.value.totalIngresos;
          this.totalVentas = data.value.totalVentas;
          this.totalProductos = data.value.totalProductos;

          const arrayData: any[] = data.value.ventasUltimaSemana;

          const labelTemp = arrayData.map((value) => value.fecha);
          const dataTemp = arrayData.map((value) => value.total);

          this.mostarGrafico(labelTemp,dataTemp);
        }
      },
      error: (e) => {}
    })
    
  }

}
